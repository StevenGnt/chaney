import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	CartesianGrid,
	Legend,
	Line,
	LineChart,
	ReferenceLine,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import { Message } from '@/components/Message';
import { Section } from '@/components/Section';
import type { Account, Threshold } from '@/features/ForecastWorkspace/types';
import { buildChartDataset } from '@/features/ForecastWorkspace/utils/chartDataset';
import { DEFAULT_COLOR } from '@/lib/constants';
import type { AccountProjection } from '@/lib/finance/projection';
import { formatCurrency, formatDateLabel, formatDateVerbose } from '@/lib/format';

import DayTransactions from './DayTransactions';

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
	const [activeDayTransactions, setActiveDayTransactions] = useState<string[] | null>(null);
	const data = useMemo(() => buildChartDataset(projections), [projections]);

	if (data.length === 0 || accounts.length === 0) {
		return (
			<Section>
				<Message>{t('FORECAST.STATE.NO_DATA')}</Message>
			</Section>
		);
	}

	const account = accounts[0]; // For now, only show the first account

	const closeActiveDayTransactions = () => {
		setActiveDayTransactions(null);
	};

	const onChartClick: React.ComponentProps<typeof LineChart>['onClick'] = (nextState) => {
		if (activeDayTransactions) {
			closeActiveDayTransactions();
		} else {
			const dayTransactions = projections[0].points.filter((point) => point.date === nextState.activeLabel);

			if (dayTransactions.length > 0) {
				setActiveDayTransactions(dayTransactions[0].transactions);
			}
		}
	};

	return (
		<Section>
			<ResponsiveContainer width="100%" height={CHART_HEIGHT}>
				<LineChart data={data} onClick={onChartClick}>
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
						content={<CustomTooltip accounts={accounts} currency={account.currency} />}
					/>
					<Legend />
					{thresholds.map((threshold) => (
						<ReferenceLine
							key={threshold.id}
							y={threshold.amount}
							stroke={threshold.color ?? DEFAULT_THRESHOLD_COLOR}
							strokeDasharray="4 4"
							label={{
								value: `${threshold.label} (${formatCurrency(threshold.amount, threshold.currency)})`,
								fill: threshold.color ?? DEFAULT_THRESHOLD_COLOR,
							}}
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

			{activeDayTransactions && (
				<DayTransactions
					account={account}
					transactionsIds={activeDayTransactions}
					onClose={closeActiveDayTransactions}
				/>
			)}
		</Section>
	);
}

interface CustomTooltipProps {
	active?: boolean;
	payload?: { color?: string; name?: string; value?: number }[];
	label?: string;
	accounts: Account[];
	currency: string;
}

function CustomTooltip({ active, payload, label, accounts, currency }: CustomTooltipProps) {
	if (!active || !payload || payload.length === 0) {
		return null;
	}

	return (
		<div className="rounded-xl border border-white/10 bg-slate-900/90 px-4 py-3 text-sm text-white shadow-xl backdrop-blur">
			<p className="mb-2 text-xs text-slate-300">{label ? formatDateVerbose(label) : ''}</p>
			<ul className="space-y-1">
				{payload.map((entry) => {
					if (entry.value == null) return null;
					const account = accounts.find((candidate) => candidate.name === entry.name);

					return (
						<li key={entry.name} className="flex items-center justify-between gap-3">
							<span className="flex items-center gap-2">
								<span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color ?? account?.color }} />
								{entry.name}
							</span>
							<span className="text-xs text-slate-200">
								{formatCurrency(entry.value, account?.currency ?? currency)}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
