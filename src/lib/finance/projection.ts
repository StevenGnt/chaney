import { formatISO, parseISO } from 'date-fns';

import type { Account, DateRange, RecurringTransaction } from '@/features/ForecastWorkspace/types';

import { generateRecurringOccurrences } from './recurringSchedule';

export interface ForecastRange extends DateRange {
	end: string;
}

export interface BalancePoint {
	date: string;
	balance: number;
}

export interface AccountProjection {
	accountId: string;
	points: BalancePoint[];
}

const ISO_OPTIONS = { representation: 'date' } as const;

/**
 * Create a date key from a date.
 *
 * @param date - Date to convert.
 * @returns A ISO date string.
 */
function toDateKey(date: Date): string {
	return formatISO(date, ISO_OPTIONS);
}

/**
 * Projects the balance evolution for a single account over a given forecast range.
 *
 * @param account - Source account including initial balance, start date and transactions.
 * @param range - Inclusive date range (ISO dates) to compute the projection for.
 * @returns A time series of dated balance points for the given account.
 */
export function projectAccountBalance(account: Account, range: ForecastRange): AccountProjection {
	const accountStart = parseISO(account.initialDate);
	const forecastStart = parseISO(range.start);
	const forecastEnd = parseISO(range.end);

	// Build events from account start date, keyed by ISO date
	const eventsByDate = buildTransactionsEvents(account, {
		start: account.initialDate,
		end: range.end,
	});

	// Get all dates, sorted chronologically
	const dates = Array.from(eventsByDate.keys()).sort();

	// Compute balance from account start to forecast start
	let balanceAtForecastStart = account.initialBalance;

	// If account starts in the future, use initial balance
	if (accountStart > forecastStart) {
		balanceAtForecastStart = account.initialBalance;
	} else {
		// Process events from account start to forecast start
		balanceAtForecastStart += dates
			.filter((date) => parseISO(date) < forecastStart)
			.flatMap((date) => eventsByDate.get(date) ?? [])
			.reduce((sum, amount) => sum + amount, 0);
	}

	// Generate points for every day in the forecast range
	const points: BalancePoint[] = [];
	let currentBalance = balanceAtForecastStart;

	// Track which dates have events
	const eventDates = new Set(dates);

	// Create a point for every day in the forecast range
	const currentDate = new Date(forecastStart);
	const endDate = new Date(forecastEnd);

	while (currentDate <= endDate) {
		const dateKey = toDateKey(currentDate);

		// Apply events for this date if any
		if (eventDates.has(dateKey)) {
			const amounts = eventsByDate.get(dateKey) ?? [];
			for (const amount of amounts) {
				currentBalance += amount;
			}
		}

		points.push({
			date: dateKey,
			balance: currentBalance,
		});

		// Move to next day
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return {
		accountId: account.id,
		points,
	};
}

/**
 * Flattens all transactions of an account into dated events within the given window.
 *
 * @param account - Account whose transactions should be expanded.
 * @param window - Forecast window limiting the generated events.
 * @returns A map of ISO dates to arrays of amounts for that date.
 */
function buildTransactionsEvents(account: Account, window: ForecastRange): Map<string, number[]> {
	const rangeStart = parseISO(window.start);
	const rangeEnd = parseISO(window.end);
	const accountStart = parseISO(account.initialDate);
	const eventsByDate = new Map<string, number[]>();

	for (const transaction of account.transactions) {
		const base = transaction.amount;

		if (base === 0) {
			continue;
		}

		// Only apply tax to positive amounts (income)
		const amount = base > 0 && transaction.taxRate ? +(base * (1 - transaction.taxRate)).toFixed(2) : base;

		// Collect date keys for this transaction
		const dateKeys: string[] = [];

		switch (transaction.schedule.kind) {
			case 'single': {
				const occurrence = parseISO(transaction.schedule.date);
				if (occurrence >= rangeStart && occurrence <= rangeEnd && occurrence >= accountStart) {
					dateKeys.push(toDateKey(occurrence));
				}
				break;
			}
			case 'recurring': {
				const occurrences = generateRecurringOccurrences(transaction as RecurringTransaction, rangeStart, rangeEnd);
				for (const occurrence of occurrences) {
					dateKeys.push(toDateKey(occurrence));
				}
				break;
			}
		}

		// Add all events for this transaction at once
		for (const dateKey of dateKeys) {
			const existing = eventsByDate.get(dateKey);
			if (existing) {
				existing.push(amount);
			} else {
				eventsByDate.set(dateKey, [amount]);
			}
		}
	}

	return eventsByDate;
}
