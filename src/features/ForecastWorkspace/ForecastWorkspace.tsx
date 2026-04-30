import clsx from 'clsx';
import { addMonths, formatISO, parseISO } from 'date-fns';
import { useMemo, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AccountSelector } from '@/features/ForecastWorkspace/components/AccountSelector';
import { DateRangeSelector } from '@/features/ForecastWorkspace/components/DateRangeSelector';
import { ForecastChart } from '@/features/ForecastWorkspace/components/ForecastChart';
import { TransactionsPanel } from '@/features/ForecastWorkspace/components/TransactionsPanel';
import { useForecastData } from '@/features/ForecastWorkspace/hooks/useForecastData';
import { useForecastQuery } from '@/features/ForecastWorkspace/hooks/useForecastQuery';
import type { DateRangePreset } from '@/features/ForecastWorkspace/utils/range';
import type { ForecastRange } from '@/lib/finance/projection';

const DEFAULT_DURATION_MONTHS = 12;

const BASE_DATE_RANGE_PRESETS = [
	{ id: '6m', months: 6 },
	{ id: '12m', months: 12 },
	{ id: '24m', months: 24 },
	{ id: '48m', months: 48 },
] as const;

interface ForecastDateRangeSelectorProps {
	duration: number;
	onDurationChange: (duration: number) => void;
}

function ForecastDateRangeSelector(props: ForecastDateRangeSelectorProps) {
	const { t } = useTranslation();

	const { duration, onDurationChange } = props;

	const presets: DateRangePreset[] = BASE_DATE_RANGE_PRESETS.map((preset) => ({
		...preset,
		label: t('FORECAST.RANGE.NEXT_MONTHS', { count: preset.months }),
	}));

	return <DateRangeSelector duration={duration} presets={presets} onDurationChange={onDurationChange} />;
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
	const [duration, setDuration] = useState<number>(DEFAULT_DURATION_MONTHS);
	const [selectedAccountIds, setSelectedAccountIds] = useState<string[] | null>(null);
	const [effectiveStartDate, setEffectiveStartDate] = useState<string>(() => {
		return new Date().toISOString().slice(0, 10);
	});

	// Compute the full date range from duration and effective start date
	const dateRange = useMemo<ForecastRange>(() => {
		const startDate = parseISO(effectiveStartDate);
		const endDate = addMonths(startDate, duration);
		return {
			start: effectiveStartDate,
			end: formatISO(endDate, { representation: 'date' }),
		};
	}, [effectiveStartDate, duration]);

	const forecastQuery = useForecastQuery(dateRange);

	// Compute effective start date from data: max(today, earliest account date)
	const computedEffectiveStartDate = useMemo(() => {
		if (!forecastQuery.data) {
			return effectiveStartDate;
		}

		const today = new Date().toISOString().slice(0, 10);
		const earliest = forecastQuery.data.accounts.reduce(
			(current, account) => (account.initialDate < current ? account.initialDate : current),
			forecastQuery.data.accounts[0]?.initialDate ?? today,
		);

		return earliest > today ? earliest : today;
	}, [forecastQuery.data, effectiveStartDate]);

	// Update effective start date when computed value changes
	useEffect(() => {
		if (computedEffectiveStartDate !== effectiveStartDate) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setEffectiveStartDate(computedEffectiveStartDate);
		}
	}, [computedEffectiveStartDate, effectiveStartDate]);

	// Initialize selectedAccountIds to all accounts once data is loaded
	const initialAccountIds = useMemo(() => {
		return forecastQuery.data?.accounts.map((account) => account.id) ?? null;
	}, [forecastQuery.data]);

	useEffect(() => {
		if (initialAccountIds !== null && selectedAccountIds === null) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setSelectedAccountIds(initialAccountIds);
		}
	}, [initialAccountIds, selectedAccountIds]);

	const forecastData = useForecastData({
		queryResult: forecastQuery.data,
		selectedAccountIds: selectedAccountIds ?? [],
	});

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
				accounts={forecastData.allAccounts}
				selectedAccountIds={selectedAccountIds ?? []}
				onToggleAccount={(accountId) => {
					setSelectedAccountIds((current) => {
						const currentIds = current ?? [];
						return currentIds.includes(accountId)
							? currentIds.filter((id) => id !== accountId)
							: [...currentIds, accountId];
					});
				}}
			/>

			<ForecastDateRangeSelector duration={duration} onDurationChange={setDuration} />

			<ForecastChart
				accounts={forecastData.filteredAccounts}
				projections={forecastData.filteredProjections}
				thresholds={forecastData.thresholds}
			/>

			<TransactionsPanel accounts={forecastData.filteredAccounts} dateRange={dateRange} />
		</ForecastWorkspaceWrapper>
	);
}

export default ForecastWorkspace;
