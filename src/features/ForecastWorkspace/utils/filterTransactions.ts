import { addMonths, addWeeks, addYears, parseISO } from 'date-fns';

import type { Account, Transaction } from '@/features/ForecastWorkspace/types';
import type { ForecastRange } from '@/lib/finance/projection';

export type TransactionGroupType = 'monthly' | 'weekly' | 'single';

export interface VisibleTransaction {
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

/**
 * Filters transactions that have at least one occurrence in the selected date range,
 * determines their group type (monthly/weekly/single), and enriches with account metadata.
 *
 * @param accounts - All accounts to filter from.
 * @param selectedAccountIds - Array of account IDs to include. Empty array means all accounts.
 * @param dateRange - Forecast date range to filter transactions by.
 * @returns Array of visible transactions with enriched metadata.
 */
export function filterTransactions(
	accounts: Account[],
	selectedAccountIds: string[],
	dateRange: ForecastRange,
): VisibleTransaction[] {
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
): Date | null {
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
function advanceDate(date: Date, frequency: 'weekly' | 'monthly' | 'yearly', every: number): Date {
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
function isInterrupted(date: Date, windows: { start: Date; end: Date }[]): boolean {
	return windows.some((window) => date >= window.start && date <= window.end);
}
