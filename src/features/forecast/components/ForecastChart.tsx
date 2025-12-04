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
import type { Account, Threshold } from '@/features/forecast/types';
import type { ChartDatum } from '@/features/forecast/utils/build-chart-dataset';
import { formatCurrency, formatDateLabel, formatDateVerbose } from '@/lib/format';

const DEFAULT_CURRENCY = 'EUR';
const CHART_HEIGHT = 400;
const GRID_STROKE = 'rgba(255,255,255,0.08)';
const GRID_DASH = '3 3';
const CURSOR_STROKE = '#f8fafc';
const CURSOR_DASH = '3 3';
const DEFAULT_ACCOUNT_COLOR = '#34d399';
const DEFAULT_THRESHOLD_COLOR = '#f472b6';

interface ForecastChartProps {
	data: ChartDatum[];
	accounts: Account[];
	thresholds: Threshold[];
}

export function ForecastChart({ data, accounts, thresholds }: ForecastChartProps) {
	if (data.length === 0 || accounts.length === 0) {
		return (
			<div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 text-sm text-slate-400">
				No data available yet.
			</div>
		);
	}

	const currency = accounts[0]?.currency ?? DEFAULT_CURRENCY;

	return (
		<div className="rounded-3xl border border-white/10 bg-black/30 p-4">
			<ResponsiveContainer width="100%" height={CHART_HEIGHT}>
				<LineChart data={data}>
					<CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_DASH} />
					<XAxis
						dataKey="date"
						stroke="#94a3b8"
						tickFormatter={(value) => formatDateLabel(String(value))}
						tick={{ fontSize: 12 }}
					/>
					<YAxis
						stroke="#94a3b8"
						tickFormatter={(value) => formatCurrency(Number(value), currency)}
						tick={{ fontSize: 12 }}
					/>
					<Tooltip
						cursor={{ stroke: CURSOR_STROKE, strokeDasharray: CURSOR_DASH }}
						content={<CustomTooltip accounts={accounts} currency={currency} />}
					/>
					<Legend />
					{thresholds.map((threshold) => (
						<ReferenceLine
							key={threshold.id}
							y={threshold.amount}
							stroke={threshold.color ?? DEFAULT_THRESHOLD_COLOR}
							strokeDasharray="4 4"
							label={{
								value: `${threshold.label} (${formatCurrency(
									threshold.amount,
									threshold.currency,
								)})`,
								fill: threshold.color ?? DEFAULT_THRESHOLD_COLOR,
							}}
						/>
					))}
					{accounts.map((account) => (
						<Line
							key={account.id}
							type="monotone"
							dataKey={account.id}
							name={account.name}
							stroke={account.color ?? DEFAULT_ACCOUNT_COLOR}
							strokeWidth={2}
							dot={false}
							isAnimationActive={false}
						/>
					))}
				</LineChart>
			</ResponsiveContainer>
		</div>
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
								<span
									className="h-2 w-2 rounded-full"
									style={{ backgroundColor: entry.color ?? account?.color }}
								/>
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
