import { parseISO } from 'date-fns';

import type { Account, RecurringTransaction, Transaction } from '@/features/ForecastWorkspace/types';
import type { ForecastRange } from '@/lib/finance/projection';
import { generateRecurringOccurrences } from '@/lib/finance/recurringSchedule';

export type TransactionGroupType = 'monthly' | 'weekly' | 'single';

export interface VisibleTransaction {
	id: string;
	label: string;
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
 * @param accounts - Accounts to filter from (already filtered by selection).
 * @param dateRange - Forecast date range to filter transactions by.
 * @returns Array of visible transactions with enriched metadata.
 */
export function filterTransactions(accounts: Account[], dateRange: ForecastRange): VisibleTransaction[] {
	const collected: VisibleTransaction[] = [];

	for (const account of accounts) {
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
	const windowStart = parseISO(dateRange.start);
	const windowEnd = parseISO(dateRange.end);

	const occurrences = generateRecurringOccurrences(transaction as RecurringTransaction, windowStart, windowEnd);

	// Return the first occurrence, if any
	return occurrences.length > 0 ? occurrences[0] : null;
}
