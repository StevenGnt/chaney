import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	type TooltipContentProps,
	XAxis,
	YAxis,
} from 'recharts';

import Amount from '@/components/Amount';
import { Message } from '@/components/Message';
import { Section } from '@/components/Section';
import type { Account, Threshold, Transaction } from '@/features/ForecastWorkspace/types';
import { buildChartDataset } from '@/features/ForecastWorkspace/utils/chartDataset';
import { DEFAULT_COLOR } from '@/lib/constants';
import type { AccountProjection } from '@/lib/finance/projection';
import { formatCurrency, formatDateLabel, formatDateVerbose } from '@/lib/format';

const CHART_HEIGHT = 400;
const GRID_STROKE = 'rgba(255,255,255,0.08)';
const GRID_DASH = '3 3';
const CURSOR_STROKE = '#f8fafc';
const CURSOR_DASH = '3 3';
const DEFAULT_ACCOUNT_COLOR = DEFAULT_COLOR;
const DEFAULT_THRESHOLD_COLOR = '#f472b6';
const DEFAULT_AXIS_COLOR = '#94a3b8';

interface ForecastChartProps {
	projections: AccountProjection[];
	accounts: Account[];
	thresholds: Threshold[];
}

export function ForecastChart({ projections, accounts, thresholds }: ForecastChartProps) {
	const { t } = useTranslation();
	const data = useMemo(() => buildChartDataset(projections), [projections]);

	if (data.length === 0 || accounts.length === 0) {
		return (
			<Section>
				<Message>{t('FORECAST.STATE.NO_DATA')}</Message>
			</Section>
		);
	}

	const ACCOUNT_INDEX = 0; // For now, only show the first account

	const account = accounts[ACCOUNT_INDEX];

	const points = projections[ACCOUNT_INDEX].points;
	const newYearsDays = points.filter((point) => point.date.endsWith('01-01')).map((point) => point.date);

	return (
		<Section>
			<ResponsiveContainer width="100%" height={CHART_HEIGHT}>
				<LineChart data={data}>
					<CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_DASH} />
					<XAxis
						dataKey="date"
						stroke={DEFAULT_AXIS_COLOR}
						tickFormatter={(value) => formatDateLabel(String(value))}
						tick={{ fontSize: 12 }}
					/>
					<YAxis
						stroke={DEFAULT_AXIS_COLOR}
						tickFormatter={(value) => formatCurrency(Number(value), account.currency)}
						tick={{ fontSize: 12 }}
					/>
					<Tooltip
						cursor={{ stroke: CURSOR_STROKE, strokeDasharray: CURSOR_DASH }}
						content={({ active, activeIndex, label, payload }: TooltipContentProps<number, string>) => {
							if (!active || !activeIndex || !label) {
								return null;
							}

							const accountData = payload[ACCOUNT_INDEX] as {
								dataKey: string;
								payload: {
									date: string;
									[accountId: string]: number | string;
								};
							};

							const accountId = accountData.dataKey;
							const account = accounts.find((candidate) => candidate.id === accountId);

							if (!account) {
								return null;
							}

							const dayValue = accountData.payload[accountId];
							const { date } = accountData.payload;
							const dayTransactionsIds = points.find((candidate) => candidate.date === date)?.transactions ?? [];

							const tooltipAccounts = [
								{
									account,
									dayValue: dayValue as number,
									dayTransactions: dayTransactionsIds.reduce((output: Transaction[], id) => {
										const match = account.transactions.find((transaction) => transaction.id === id);
										return match ? [...output, match] : output;
									}, []),
								},
							];

							return (
								<CustomTooltipContent title={formatDateVerbose(label as string)} tooltipAccounts={tooltipAccounts} />
							);
						}}
					/>
					<Legend />

					{thresholds.map((threshold) => (
						<ReferenceLine
							key={threshold.id}
							y={threshold.amount}
							stroke={threshold.color ?? DEFAULT_THRESHOLD_COLOR}
							strokeDasharray="4 4"
							label={{
								value: `${threshold.label} - ${formatCurrency(threshold.amount, threshold.currency)}`,
								fill: threshold.color ?? DEFAULT_THRESHOLD_COLOR,
							}}
						/>
					))}

					{newYearsDays.length > 0 &&
						newYearsDays.map((newYearDay) => (
							<ReferenceLine
								key={'new-year-${newYearDay}'}
								x={newYearDay}
								stroke="white"
								strokeDasharray="4"
								opacity="0.5"
							/>
						))}

					{accounts.map(({ id, name, color }) => (
						<Line
							key={id}
							type="monotone"
							dataKey={id}
							name={name}
							stroke={color ?? DEFAULT_ACCOUNT_COLOR}
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</Section>
	);
}

interface CustomTooltipContentProps {
	title: string;
	tooltipAccounts: {
		account: Account;
		dayValue: number;
		dayTransactions: Transaction[];
	}[];
}

function CustomTooltipContent({ title, tooltipAccounts }: CustomTooltipContentProps) {
	return (
		<div className="rounded-xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white shadow-xl backdrop-blur">
			{title && <p className="mb-2 text-xs text-slate-300">{title}</p>}
			<ul className="space-y-1">
				{tooltipAccounts.map(({ account, dayValue, dayTransactions }) => (
					<li key={account.id}>
						<div className="flex items-center justify-between gap-3">
							<span className="flex items-center gap-2">
								<span className="h-2 w-2 rounded-full" style={{ backgroundColor: account.color }} />
								{account.name}
							</span>
							<span className="text-xs text-slate-200">{formatCurrency(dayValue, account.currency)}</span>
						</div>

						{dayTransactions.length > 0 && (
							<div className="flex items-center justify-between gap-3">
								<ul>
									{dayTransactions.map((transaction) => (
										<li key={transaction.id}>
											{transaction.label} <Amount amount={transaction.amount} currency={account.currency} />
										</li>
									))}
								</ul>
							</div>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}
