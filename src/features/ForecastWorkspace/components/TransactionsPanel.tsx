import { useMemo } from 'react';
import { addMonths, addWeeks, addYears, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { ForecastRange } from '@/lib/finance/projection';
import type { Account, Transaction } from '@/features/ForecastWorkspace/types';
import { Section } from '@/components/Section';
import { Hint } from '@/components/Hint';

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

interface TransactionsPanelProps {
	accounts: Account[];
	selectedAccountIds: string[];
	dateRange: ForecastRange;
}

export function TransactionsPanel({ accounts, selectedAccountIds, dateRange }: TransactionsPanelProps) {
	const { t } = useTranslation();

	// Filter transactions that have at least one occurrence in the selected date range,
	// determine their group type (monthly/weekly/single), and enrich with account metadata
	const visibleTransactions = useMemo<VisibleTransaction[]>(() => {
		const filteredAccounts =
			selectedAccountIds.length > 0 ? accounts.filter((account) => selectedAccountIds.includes(account.id)) : accounts;

		const collected: VisibleTransaction[] = [];

		for (const account of filteredAccounts) {
			for (const transaction of account.transactions) {
				// Check if transaction has any occurrence in the forecast date range
				const firstOccurrence = getFirstTransactionOccurrenceInRange(transaction, account.initialDate, dateRange);
				if (!firstOccurrence) continue;

				// Determine transaction group type based on schedule frequency
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
	}, [accounts, selectedAccountIds, dateRange]);

	// Group transactions by account ID for collapsible account sections
	const groupedTransactions = useMemo(() => {
		const groups: {
			accountId: string;
			accountName: string;
			accountColor?: string;
			currency: string;
			items: VisibleTransaction[];
		}[] = [];

		const byId = new Map<string, (typeof groups)[number]>();

		// Group transactions by account ID
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

	if (groupedTransactions.length === 0) {
		return null;
	}

	return (
		<Section title={t('FORECAST.TRANSACTIONS.TITLE')} hint={t('FORECAST.TRANSACTIONS.HINT')}>
			<div className="max-h-60 space-y-2 overflow-auto pr-1 text-sm">
				{groupedTransactions.map((group) => (
					<AccountTransactionsGroup key={group.accountId} group={group} />
				))}
			</div>
		</Section>
	);
}

/**
 * Finds the first occurrence date of a transaction within the given forecast date range.
 *
 * For single transactions, checks if the date falls within the date range.
 * For recurring transactions, iterates through occurrences until finding one
 * within the date range, respecting interruptions and occurrence limits.
 *
 * @param transaction - Transaction to check for occurrences.
 * @param accountStartISO - ISO date when the account becomes active.
 * @param dateRange - Forecast date range to search within.
 * @returns The first occurrence date within the date range, or null if none exists.
 */
function getFirstTransactionOccurrenceInRange(
	transaction: Transaction,
	accountStartISO: string,
	dateRange: ForecastRange,
) {
	// Handle single-occurrence transactions
	if (transaction.schedule.kind === 'single') {
		const date = parseISO(transaction.schedule.date);
		const rangeStart = parseISO(dateRange.start);
		const rangeEnd = parseISO(dateRange.end);
		const accountStart = parseISO(accountStartISO);

		// Must be after account start and within the forecast date range
		return date >= accountStart && date >= rangeStart && date <= rangeEnd ? date : null;
	}

	// Handle recurring transactions
	const schedule = transaction.schedule;
	const every = schedule.every;
	const accountStart = parseISO(accountStartISO);
	const scheduleStart = parseISO(schedule.startDate);
	// Use the later of account start or schedule start
	const startDate = accountStart > scheduleStart ? accountStart : scheduleStart;
	const windowStart = parseISO(dateRange.start);
	const windowEnd = parseISO(dateRange.end);
	const scheduleEnd = schedule.endDate ? parseISO(schedule.endDate) : windowEnd;
	// Use the earlier of schedule end or forecast window end
	const maxEnd = scheduleEnd < windowEnd ? scheduleEnd : windowEnd;

	// No valid range if start is after max end
	if (startDate > maxEnd) {
		return null;
	}

	// Convert interruption periods to Date objects for comparison
	const interruptions = schedule.interruptions.map((period) => ({
		start: parseISO(period.start),
		end: period.end ? parseISO(period.end) : windowEnd,
	}));

	let occurrences = 0;
	let cursor = startDate;

	// Iterate through potential occurrence dates
	while (cursor <= maxEnd) {
		// Skip dates within interruption windows
		if (!isInterrupted(cursor, interruptions)) {
			const inWindow = cursor >= windowStart && cursor <= windowEnd;
			if (inWindow) {
				return cursor;
			}
		}

		occurrences += 1;
		// Stop if we've reached the maximum number of occurrences
		if (schedule.occurrences && occurrences >= schedule.occurrences) {
			break;
		}

		// Advance to the next occurrence date
		cursor = advanceDate(cursor, schedule.frequency, every);
	}

	return null;
}

/**
 * Advances a date by the specified frequency and interval multiplier.
 *
 * @param date - Current date to advance from.
 * @param frequency - Recurrence frequency (weekly, monthly, or yearly).
 * @param every - Number of frequency units to advance (e.g., every 2 weeks).
 * @returns The advanced date.
 */
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

/**
 * Checks if a date falls within any of the provided interruption windows.
 *
 * @param date - Date to check.
 * @param windows - Array of interruption periods, each with start and end dates.
 * @returns True if the date is within any interruption window, false otherwise.
 */
function isInterrupted(date: Date, windows: { start: Date; end: Date }[]) {
	return windows.some((window) => date >= window.start && date <= window.end);
}

interface AccountTransactionsGroupProps {
	group: {
		accountId: string;
		accountName: string;
		accountColor?: string;
		items: VisibleTransaction[];
	};
}

function AccountTransactionsGroup({ group }: AccountTransactionsGroupProps) {
	const { t } = useTranslation();

	// Group transactions by type (monthly/weekly/single) and sort each group chronologically
	const groupedByType = useMemo(() => {
		const monthly = group.items
			.filter((item) => item.groupType === 'monthly')
			.sort((left, right) => left.firstOccurrence.getTime() - right.firstOccurrence.getTime());
		const weekly = group.items
			.filter((item) => item.groupType === 'weekly')
			.sort((left, right) => left.firstOccurrence.getTime() - right.firstOccurrence.getTime());
		const single = group.items
			.filter((item) => item.groupType === 'single')
			.sort((left, right) => left.firstOccurrence.getTime() - right.firstOccurrence.getTime());

		return { monthly, weekly, single };
	}, [group.items]);

	return (
		<details className="rounded-s border border-white/10 bg-white/5">
			<summary className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2">
				<span className="flex items-center gap-2">
					<span className="h-2 w-2 rounded-full" style={{ backgroundColor: group.accountColor ?? '#34d399' }} />
					<span className="font-semibold text-white">
						{group.accountName} <Hint>({t('FORECAST.TRANSACTIONS.COUNT', { count: group.items.length })})</Hint>
					</span>
				</span>
			</summary>
			<div className="space-y-2 border-t border-white/10 px-3 py-2">
				{groupedByType.monthly.length > 0 && (
					<TransactionGroup label={t('FORECAST.TRANSACTIONS.MONTHLY')} transactions={groupedByType.monthly} />
				)}
				{groupedByType.weekly.length > 0 && (
					<TransactionGroup label={t('FORECAST.TRANSACTIONS.WEEKLY')} transactions={groupedByType.weekly} />
				)}
				{groupedByType.single.length > 0 && (
					<TransactionGroup label={t('FORECAST.TRANSACTIONS.SINGLE')} transactions={groupedByType.single} />
				)}
			</div>
		</details>
	);
}

interface TransactionGroupProps {
	transactions: VisibleTransaction[];
	label: string;
}

function TransactionGroup({ transactions, label }: TransactionGroupProps) {
	return (
		<div>
			<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-300">{label}</p>
			<ul className="space-y-1">
				{transactions.map((transaction) => (
					<TransactionItem key={transaction.id} transaction={transaction} />
				))}
			</ul>
		</div>
	);
}

interface TransactionItemProps {
	transaction: VisibleTransaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
	return (
		<li className="flex items-center justify-between gap-3">
			<div>
				<p className="font-medium text-white">{transaction.label}</p>
				<p className="text-xs text-slate-400">{transaction.category}</p>
			</div>
			<span
				className={['text-xs font-semibold', transaction.type === 'income' ? 'text-emerald-300' : 'text-rose-300'].join(
					' ',
				)}
			>
				{transaction.type === 'income' ? '+' : '-'}
				{transaction.amount.toLocaleString(undefined, {
					style: 'currency',
					currency: transaction.currency,
				})}
			</span>
		</li>
	);
}
