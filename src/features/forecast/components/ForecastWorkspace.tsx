import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createRangeFromMonths, type RangePreset } from '@/features/forecast/utils/range';
import { buildChartDataset } from '@/features/forecast/utils/build-chart-dataset';
import { AccountToggleList } from '@/features/forecast/components/AccountToggleList';
import { RangeSelector } from '@/features/forecast/components/RangeSelector';
import { ForecastChart } from '@/features/forecast/components/ForecastChart';
import { useForecastQuery } from '@/features/forecast/hooks/useForecastQuery';
import type { ForecastRange } from '@/lib/finance/projection';
import { formatDateVerbose } from '@/lib/format';

const DEFAULT_RANGE_START = new Date().toISOString().slice(0, 10);
const DEFAULT_RANGE_MONTHS = 12;
const DEFAULT_PRESET_ID = '12m';

const BASE_PRESETS = [
	{ id: '3m', months: 3 },
	{ id: '6m', months: 6 },
	{ id: '12m', months: 12 },
	{ id: '24m', months: 24 },
] as const;

const DEFAULT_RANGE: ForecastRange = createRangeFromMonths(DEFAULT_RANGE_START, DEFAULT_RANGE_MONTHS);

interface ForecastRangeSelectorProps {
	range: ForecastRange;
	activePresetId: string;
	onPresetChange: (preset: RangePreset) => void;
	onRangeChange: (range: ForecastRange) => void;
}

function ForecastRangeSelector({ range, activePresetId, onPresetChange, onRangeChange }: ForecastRangeSelectorProps) {
	const { t } = useTranslation();

	const presets: RangePreset[] = BASE_PRESETS.map((preset) => ({
		...preset,
		label: t('FORECAST.RANGE.NEXT_MONTHS', { count: preset.months }),
	}));

	return (
		<RangeSelector
			range={range}
			presets={presets}
			activePresetId={activePresetId}
			onPresetChange={onPresetChange}
			onRangeChange={onRangeChange}
		/>
	);
}

function ForecastWorkspaceLoadingState() {
	return (
		<div className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6">
			<div className="h-6 w-48 animate-pulse rounded bg-white/10" />
			<div className="h-80 animate-pulse rounded-2xl bg-white/5" />
		</div>
	);
}

function ForecastWorkspaceErrorState() {
	const { t } = useTranslation();

	return (
		<div className="rounded-3xl border border-red-400/40 bg-red-500/10 p-6 text-sm text-red-200">
			{t('FORECAST.STATE.ERROR')}
		</div>
	);
}

export function ForecastWorkspace() {
	const { t } = useTranslation();
	const [range, setRange] = useState<ForecastRange>(DEFAULT_RANGE);
	const [activePresetId, setActivePresetId] = useState(DEFAULT_PRESET_ID);
	const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
	const autoAlignedRange = useRef(false);
	const forecastQuery = useForecastQuery(range);

	useEffect(() => {
		if (!forecastQuery.data || selectedAccountIds.length > 0) {
			return;
		}

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setSelectedAccountIds(forecastQuery.data.accounts.map((account) => account.id));
	}, [forecastQuery.data, selectedAccountIds.length]);

	useEffect(() => {
		if (!forecastQuery.data || autoAlignedRange.current) {
			return;
		}

		const earliest = forecastQuery.data.accounts.reduce((current, account) => {
			return account.initialDate < current ? account.initialDate : current;
		}, forecastQuery.data.accounts[0]?.initialDate ?? range.start);

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setRange((previousRange) => {
			if (previousRange.start === earliest) {
				return previousRange;
			}

			const preset = BASE_PRESETS.find((item) => item.id === activePresetId) ?? BASE_PRESETS[2];
			return createRangeFromMonths(earliest, preset.months);
		});

		autoAlignedRange.current = true;
	}, [forecastQuery.data, activePresetId, range.start]);

	const dataset = useMemo(() => {
		if (!forecastQuery.data) {
			return [];
		}

		return buildChartDataset(forecastQuery.data.projections, selectedAccountIds);
	}, [forecastQuery.data, selectedAccountIds]);

	const summaries = useMemo(() => {
		if (!forecastQuery.data) {
			return {};
		}

		const summary: Record<string, { endBalance: number; delta: number }> = {};

		for (const projection of forecastQuery.data.projections) {
			if (selectedAccountIds.length > 0 && !selectedAccountIds.includes(projection.accountId)) {
				continue;
			}

			const first = projection.points[0]?.balance ?? 0;
			const last = projection.points.at(-1)?.balance ?? first;

			summary[projection.accountId] = {
				endBalance: last,
				delta: last - first,
			};
		}

		return summary;
	}, [forecastQuery.data, selectedAccountIds]);

	const selectedAccounts =
		forecastQuery.data?.accounts.filter((account) => selectedAccountIds.includes(account.id)) ?? [];

	const handlePresetChange = (preset: RangePreset) => {
		setActivePresetId(preset.id);
		const todayISO = new Date().toISOString().slice(0, 10);
		setRange(createRangeFromMonths(todayISO, preset.months));
	};

	const handleRangeChange = (updated: ForecastRange) => {
		setActivePresetId('custom');
		setRange(updated);
	};

	const toggleAccount = (accountId: string) => {
		setSelectedAccountIds((current) =>
			current.includes(accountId) ? current.filter((id) => id !== accountId) : [...current, accountId],
		);
	};

	if (forecastQuery.isPending) {
		return <ForecastWorkspaceLoadingState />;
	}

	if (forecastQuery.isError) {
		return <ForecastWorkspaceErrorState />;
	}

	return (
		<section className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<p className="text-xs uppercase tracking-[0.3em] text-emerald-300">{t('FORECAST.WORKSPACE.PILL')}</p>
					<h2 className="text-2xl font-semibold text-white">{t('FORECAST.WORKSPACE.TITLE')}</h2>
					<p className="text-sm text-slate-300">
						{t('FORECAST.WORKSPACE.CAPTION', {
							start: formatDateVerbose(range.start),
							end: formatDateVerbose(range.end),
						})}
					</p>
				</div>
			</div>

			<ForecastRangeSelector
				range={range}
				activePresetId={activePresetId}
				onPresetChange={handlePresetChange}
				onRangeChange={handleRangeChange}
			/>

			<ForecastChart
				data={dataset}
				accounts={selectedAccounts.length > 0 ? selectedAccounts : forecastQuery.data.accounts}
				thresholds={forecastQuery.data.thresholds}
			/>

			<AccountToggleList
				accounts={forecastQuery.data.accounts}
				selectedIds={selectedAccountIds}
				onToggle={toggleAccount}
				summaries={summaries}
			/>
		</section>
	);
}
