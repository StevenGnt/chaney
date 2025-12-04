import { useEffect, useMemo, useRef, useState } from 'react';
import { addMonths, addWeeks, addYears, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { createRangeFromMonths, type RangePreset } from '@/features/forecast/utils/range';
import { buildChartDataset } from '@/features/forecast/utils/build-chart-dataset';
import { AccountToggleList } from '@/features/forecast/components/AccountToggleList';
import { RangeSelector } from '@/features/forecast/components/RangeSelector';
import { ForecastChart } from '@/features/forecast/components/ForecastChart';
import { useForecastQuery } from '@/features/forecast/hooks/useForecastQuery';
import type { ForecastRange } from '@/lib/finance/projection';
import type { Transaction } from '@/features/forecast/types';
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

type TransactionGroupType = 'monthly' | 'weekly' | 'single';

interface VisibleTransaction {
	id: string;
	label: string;
	type: Transaction['type'];
	category: string;
	amount: number;
	firstOccurrence: Date;
	groupType: TransactionGroupType;
	accountId: string;
	accountName: string;
	accountColor?: string;
	currency: string;
}

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

	const visibleTransactions = useMemo<VisibleTransaction[]>(() => {
		if (!forecastQuery.data) {
			return [];
		}

		const accounts =
			selectedAccountIds.length > 0
				? forecastQuery.data.accounts.filter((account) => selectedAccountIds.includes(account.id))
				: forecastQuery.data.accounts;

		const collected: VisibleTransaction[] = [];

		for (const account of accounts) {
			for (const transaction of account.transactions) {
				const firstOccurrence = getFirstTransactionOccurrenceInRange(transaction, account.initialDate, range);
				if (!firstOccurrence) continue;

				let groupType: TransactionGroupType = 'single';
				if (transaction.schedule.kind === 'recurring') {
					if (transaction.schedule.frequency === 'weekly') {
						groupType = 'weekly';
					} else {
						groupType = 'monthly';
					}
				}

				collected.push({
					id: transaction.id,
					label: transaction.label,
					type: transaction.type,
					category: transaction.category,
					amount: transaction.amount,
					firstOccurrence,
					groupType,
					accountId: account.id,
					accountName: account.name,
					accountColor: account.color,
					currency: account.currency,
				});
			}
		}

		return collected;
	}, [forecastQuery.data, selectedAccountIds, range]);

	const groupedTransactions = useMemo(() => {
		const groups: {
			accountId: string;
			accountName: string;
			accountColor?: string;
			currency: string;
			items: VisibleTransaction[];
		}[] = [];

		const byId = new Map<string, (typeof groups)[number]>();

		for (const tx of visibleTransactions) {
			let group = byId.get(tx.accountId);
			if (!group) {
				group = {
					accountId: tx.accountId,
					accountName: tx.accountName,
					accountColor: tx.accountColor,
					currency: tx.currency,
					items: [],
				};
				byId.set(tx.accountId, group);
				groups.push(group);
			}
			group.items.push(tx);
		}

		return groups;
	}, [visibleTransactions]);

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

			<section className="rounded-2xl border border-white/10 bg-white/5 p-4">
				<header className="mb-3 flex items-center justify-between">
					<p className="text-sm font-semibold text-white">{t('FORECAST.ACCOUNTS.TITLE')}</p>
					<span className="text-xs text-slate-400">{t('FORECAST.ACCOUNTS.HINT')}</span>
				</header>
				<AccountToggleList
					accounts={forecastQuery.data.accounts}
					selectedIds={selectedAccountIds}
					onToggle={toggleAccount}
					summaries={summaries}
				/>
			</section>

			<ForecastChart
				data={dataset}
				accounts={selectedAccounts.length > 0 ? selectedAccounts : forecastQuery.data.accounts}
				thresholds={forecastQuery.data.thresholds}
			/>

			{groupedTransactions.length > 0 && (
				<section className="rounded-2xl border border-white/10 bg-black/30 p-4">
					<header className="mb-3 flex items-center justify-between gap-2">
						<p className="text-sm font-semibold text-white">{t('FORECAST.TRANSACTIONS.TITLE')}</p>
						<p className="text-xs text-slate-400">{t('FORECAST.TRANSACTIONS.HINT')}</p>
					</header>
					<div className="max-h-60 space-y-2 overflow-auto pr-1 text-sm">
						{groupedTransactions.map((group) => {
							const monthlyItems = [...group.items]
								.filter((item) => item.groupType === 'monthly')
								.sort((left, right) => left.firstOccurrence.getTime() - right.firstOccurrence.getTime());
							const weeklyItems = [...group.items]
								.filter((item) => item.groupType === 'weekly')
								.sort((left, right) => left.firstOccurrence.getTime() - right.firstOccurrence.getTime());
							const singleItems = [...group.items]
								.filter((item) => item.groupType === 'single')
								.sort((left, right) => left.firstOccurrence.getTime() - right.firstOccurrence.getTime());

							return (
								<details key={group.accountId} className="rounded-xl border border-white/10 bg-white/5">
									<summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2">
										<span className="flex items-center gap-2">
											<span
												className="h-2 w-2 rounded-full"
												style={{ backgroundColor: group.accountColor ?? '#34d399' }}
											/>
											<span className="font-semibold text-white">
												{group.accountName}{' '}
												<span className="text-xs font-normal text-slate-400">
													({group.items.length} transaction
													{group.items.length > 1 ? 's' : ''})
												</span>
											</span>
										</span>
									</summary>
									<div className="space-y-2 border-t border-white/10 px-3 py-2">
										{monthlyItems.length > 0 && (
											<div>
												<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-300">Monthly</p>
												<ul className="space-y-1">
													{monthlyItems.map((transaction) => (
														<li key={transaction.id} className="flex items-center justify-between gap-3">
															<div>
																<p className="font-medium text-white">{transaction.label}</p>
																<p className="text-xs text-slate-400">{transaction.category}</p>
															</div>
															<span
																className={[
																	'text-xs font-semibold',
																	transaction.type === 'income' ? 'text-emerald-300' : 'text-rose-300',
																].join(' ')}
															>
																{transaction.type === 'income' ? '+' : '-'}
																{transaction.amount.toLocaleString(undefined, {
																	style: 'currency',
																	currency: transaction.currency,
																})}
															</span>
														</li>
													))}
												</ul>
											</div>
										)}

										{weeklyItems.length > 0 && (
											<div>
												<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-300">Weekly</p>
												<ul className="space-y-1">
													{weeklyItems.map((transaction) => (
														<li key={transaction.id} className="flex items-center justify-between gap-3">
															<div>
																<p className="font-medium text-white">{transaction.label}</p>
																<p className="text-xs text-slate-400">{transaction.category}</p>
															</div>
															<span
																className={[
																	'text-xs font-semibold',
																	transaction.type === 'income' ? 'text-emerald-300' : 'text-rose-300',
																].join(' ')}
															>
																{transaction.type === 'income' ? '+' : '-'}
																{transaction.amount.toLocaleString(undefined, {
																	style: 'currency',
																	currency: transaction.currency,
																})}
															</span>
														</li>
													))}
												</ul>
											</div>
										)}

										{singleItems.length > 0 && (
											<div>
												<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-300">One-off</p>
												<ul className="space-y-1">
													{singleItems.map((transaction) => (
														<li key={transaction.id} className="flex items-center justify-between gap-3">
															<div>
																<p className="font-medium text-white">{transaction.label}</p>
																<p className="text-xs text-slate-400">{transaction.category}</p>
															</div>
															<span
																className={[
																	'text-xs font-semibold',
																	transaction.type === 'income' ? 'text-emerald-300' : 'text-rose-300',
																].join(' ')}
															>
																{transaction.type === 'income' ? '+' : '-'}
																{transaction.amount.toLocaleString(undefined, {
																	style: 'currency',
																	currency: transaction.currency,
																})}
															</span>
														</li>
													))}
												</ul>
											</div>
										)}
									</div>
								</details>
							);
						})}
					</div>
				</section>
			)}
		</section>
	);
}

function getFirstTransactionOccurrenceInRange(transaction: Transaction, accountStartISO: string, range: ForecastRange) {
	if (transaction.schedule.kind === 'single') {
		const date = parseISO(transaction.schedule.date);
		const rangeStart = parseISO(range.start);
		const rangeEnd = parseISO(range.end);
		const accountStart = parseISO(accountStartISO);

		return date >= accountStart && date >= rangeStart && date <= rangeEnd ? date : null;
	}

	const schedule = transaction.schedule;
	const every = schedule.every;
	const accountStart = parseISO(accountStartISO);
	const scheduleStart = parseISO(schedule.startDate);
	const startDate = accountStart > scheduleStart ? accountStart : scheduleStart;
	const windowStart = parseISO(range.start);
	const windowEnd = parseISO(range.end);
	const scheduleEnd = schedule.endDate ? parseISO(schedule.endDate) : windowEnd;
	const maxEnd = scheduleEnd < windowEnd ? scheduleEnd : windowEnd;

	if (startDate > maxEnd) {
		return null;
	}

	const interruptions = schedule.interruptions.map((period) => ({
		start: parseISO(period.start),
		end: period.end ? parseISO(period.end) : windowEnd,
	}));

	let occurrences = 0;
	let cursor = startDate;

	while (cursor <= maxEnd) {
		if (!isInterrupted(cursor, interruptions)) {
			const inWindow = cursor >= windowStart && cursor <= windowEnd;
			if (inWindow) {
				return cursor;
			}
		}

		occurrences += 1;
		if (schedule.occurrences && occurrences >= schedule.occurrences) {
			break;
		}

		cursor = advanceDate(cursor, schedule.frequency, every);
	}

	return null;
}

function advanceDate(date: Date, frequency: 'weekly' | 'monthly' | 'yearly', every: number) {
	switch (frequency) {
		case 'weekly':
			return addWeeks(date, every);
		case 'monthly':
			return addMonths(date, every);
		case 'yearly':
			return addYears(date, every);
		default:
			return date;
	}
}

function isInterrupted(date: Date, windows: { start: Date; end: Date }[]) {
	return windows.some((window) => date >= window.start && date <= window.end);
}
