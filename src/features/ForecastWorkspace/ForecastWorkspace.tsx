import clsx from 'clsx';
import { addMonths, differenceInMonths, formatISO, parseISO } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AccountSelector } from '@/features/ForecastWorkspace/components/AccountSelector';
import { DateRangeSelector } from '@/features/ForecastWorkspace/components/DateRangeSelector';
import { ForecastChart } from '@/features/ForecastWorkspace/components/ForecastChart';
import { TransactionsPanel } from '@/features/ForecastWorkspace/components/TransactionsPanel';
import { useForecastData } from '@/features/ForecastWorkspace/hooks/useForecastData';
import { useForecastQuery } from '@/features/ForecastWorkspace/hooks/useForecastQuery';
import type { DateRangePreset } from '@/features/ForecastWorkspace/utils/range';
import type { ForecastRange } from '@/lib/finance/projection';

const DEFAULT_DATE_RANGE_START = new Date().toISOString().slice(0, 10);
const DEFAULT_DATE_RANGE_MONTHS = 12;

const BASE_DATE_RANGE_PRESETS = [
	{ id: '3m', months: 3 },
	{ id: '6m', months: 6 },
	{ id: '12m', months: 12 },
	{ id: '24m', months: 24 },
] as const;

interface ForecastDateRangeSelectorProps {
	dateRange: ForecastRange;
	onDateRangeChange: (dateRange: ForecastRange) => void;
}

function ForecastDateRangeSelector(props: ForecastDateRangeSelectorProps) {
	const { t } = useTranslation();

	const { dateRange, onDateRangeChange } = props;

	const presets: DateRangePreset[] = BASE_DATE_RANGE_PRESETS.map((preset) => ({
		...preset,
		label: t('FORECAST.RANGE.NEXT_MONTHS', { count: preset.months }),
	}));

	return <DateRangeSelector dateRange={dateRange} presets={presets} onDateRangeChange={onDateRangeChange} />;
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
	const [dateRange, setDateRange] = useState<ForecastRange>(() => {
		const start = parseISO(DEFAULT_DATE_RANGE_START);
		const end = addMonths(start, DEFAULT_DATE_RANGE_MONTHS);
		return {
			start: DEFAULT_DATE_RANGE_START,
			end: formatISO(end, { representation: 'date' }),
		};
	});
	const [selectedAccountIds, setSelectedAccountIds] = useState<string[] | null>(null);
	const autoAlignedDateRange = useRef(false);
	const forecastQuery = useForecastQuery(dateRange);

	const forecastData = useForecastData({
		queryResult: forecastQuery.data,
		selectedAccountIds: selectedAccountIds ?? [],
	});

	// Initialize selectedAccountIds to all accounts once data is loaded
	useEffect(() => {
		if (!forecastQuery.data || selectedAccountIds !== null) {
			return;
		}

		// Select all accounts by default on first data load
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setSelectedAccountIds(forecastQuery.data.accounts.map((account) => account.id));
	}, [forecastQuery.data, selectedAccountIds]);

	// Align date range to earliest account date (only once)
	useEffect(() => {
		if (!forecastQuery.data || autoAlignedDateRange.current) {
			return;
		}

		const earliest = forecastQuery.data.accounts.reduce((current, account) => {
			return account.initialDate < current ? account.initialDate : current;
		}, forecastQuery.data.accounts[0]?.initialDate ?? dateRange.start);

		// eslint-disable-next-line react-hooks/set-state-in-effect
		setDateRange((previousDateRange) => {
			if (previousDateRange.start === earliest) {
				return previousDateRange;
			}

			// Use the current range's duration (months) when auto-aligning
			const startDate = parseISO(previousDateRange.start);
			const endDate = parseISO(previousDateRange.end);
			const currentMonths = Math.max(1, differenceInMonths(endDate, startDate));
			const newStart = parseISO(earliest);
			const newEnd = addMonths(newStart, currentMonths);
			return {
				start: earliest,
				end: formatISO(newEnd, { representation: 'date' }),
			};
		});

		autoAlignedDateRange.current = true;
	}, [forecastQuery.data, dateRange.start]);

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

			<ForecastDateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />

			<ForecastChart
				accounts={forecastData.selectedAccounts}
				projections={forecastData.filteredProjections}
				thresholds={forecastData.thresholds}
			/>

			<TransactionsPanel accounts={forecastData.filteredAccounts} dateRange={dateRange} />
		</ForecastWorkspaceWrapper>
	);
}

export default ForecastWorkspace;
