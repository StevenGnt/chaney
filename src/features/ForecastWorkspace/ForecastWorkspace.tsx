import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createRangeFromMonths, type RangePreset } from '@/features/ForecastWorkspace/utils/range';
import { buildChartDataset } from '@/features/ForecastWorkspace/utils/build-chart-dataset';
import { AccountSelector } from '@/features/ForecastWorkspace/components/AccountSelector';
import { RangeSelector } from '@/features/ForecastWorkspace/components/RangeSelector';
import { ForecastChart } from '@/features/ForecastWorkspace/components/ForecastChart';
import { useForecastQuery } from '@/features/ForecastWorkspace/hooks/useForecastQuery';
import type { ForecastRange } from '@/lib/finance/projection';
import { TransactionsPanel } from '@/features/ForecastWorkspace/components/TransactionsPanel';
import clsx from 'clsx';

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

function ForecastWorkspaceWrapper({ children, error }: { children: React.ReactNode; error?: boolean }) {
	return (
		<section
			className={clsx(
				'rounded-xl',
				'space-y-4',
				'p-6',
				'border',
				!error ? ['border-white/10', 'bg-white/5'] : ['border-red-400/40', 'bg-red-500/10', 'text-red-200'],
			)}
		>
			{children}
		</section>
	);
}

function ForecastWorkspaceLoadingState() {
	return (
		<ForecastWorkspaceWrapper>
			<div className="h-6 w-48 animate-pulse rounded bg-white/10" />
			<div className="h-80 animate-pulse rounded-xl bg-white/5" />
		</ForecastWorkspaceWrapper>
	);
}

function ForecastWorkspaceErrorState() {
	const { t } = useTranslation();

	return <ForecastWorkspaceWrapper error>{t('FORECAST.STATE.ERROR')}</ForecastWorkspaceWrapper>;
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

	// Build chart dataset from projections, filtering by selected accounts
	const dataset = useMemo(() => {
		if (!forecastQuery.data) {
			return [];
		}

		return buildChartDataset(forecastQuery.data.projections, selectedAccountIds);
	}, [forecastQuery.data, selectedAccountIds]);

	const selectedAccounts =
		forecastQuery.data?.accounts.filter((account) => selectedAccountIds.includes(account.id)) ?? [];

	if (forecastQuery.isPending) {
		return <ForecastWorkspaceLoadingState />;
	}

	if (forecastQuery.isError) {
		return <ForecastWorkspaceErrorState />;
	}

	return (
		<ForecastWorkspaceWrapper>
			<p className="text-sm text-slate-300">{t('FORECAST.WORKSPACE.DESCRIPTION')}</p>

			<AccountSelector
				accounts={forecastQuery.data.accounts}
				selectedAccountIds={selectedAccountIds}
				onToggleAccount={(accountId) => {
					setSelectedAccountIds((current) =>
						current.includes(accountId) ? current.filter((id) => id !== accountId) : [...current, accountId],
					);
				}}
			/>

			<ForecastRangeSelector
				range={range}
				activePresetId={activePresetId}
				onPresetChange={(preset) => {
					setActivePresetId(preset.id);
				}}
				onRangeChange={setRange}
			/>

			<ForecastChart
				data={dataset}
				accounts={selectedAccounts.length > 0 ? selectedAccounts : forecastQuery.data.accounts}
				thresholds={forecastQuery.data.thresholds}
			/>

			<TransactionsPanel accounts={forecastQuery.data.accounts} selectedAccountIds={selectedAccountIds} range={range} />
		</ForecastWorkspaceWrapper>
	);
}

export default ForecastWorkspace;
