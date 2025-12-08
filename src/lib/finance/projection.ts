import { addMonths, addWeeks, addYears, formatISO, parseISO } from 'date-fns';

import type { Account, DateRange, Transaction } from '@/features/ForecastWorkspace/types';

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
		for (const date of dates) {
			const dateObj = parseISO(date);
			if (dateObj >= forecastStart) {
				break;
			}
			const amounts = eventsByDate.get(date) ?? [];
			for (const amount of amounts) {
				balanceAtForecastStart += amount;
			}
		}
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
				const occurrences = expandRecurringSchedule(transaction, accountStart, rangeStart, rangeEnd);
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

/**
 * Expands a recurring transaction schedule into concrete occurrence dates within a window.
 *
 * @param transaction - Transaction with a recurring schedule.
 * @param accountStart - Date at which the account becomes active.
 * @param windowStart - Start of the forecast window.
 * @param windowEnd - End of the forecast window.
 * @returns An array of occurrence dates for the schedule within the window.
 */
function expandRecurringSchedule(transaction: Transaction, accountStart: Date, windowStart: Date, windowEnd: Date) {
	// This function is only called for recurring schedules
	const schedule = transaction.schedule as Extract<typeof transaction.schedule, { kind: 'recurring' }>;
	const scheduleStart = parseISO(schedule.startDate);
	const scheduleEnd = schedule.endDate ? parseISO(schedule.endDate) : windowEnd;
	const maxEnd = Math.min(scheduleEnd.getTime(), windowEnd.getTime());
	const startDate = Math.max(accountStart.getTime(), scheduleStart.getTime());

	const interruptions = schedule.interruptions.map((period) => ({
		start: parseISO(period.start),
		end: period.end ? parseISO(period.end) : windowEnd,
	}));

	const dates: Date[] = [];
	let occurrences = 0;
	let cursor = new Date(startDate);

	while (cursor.getTime() <= maxEnd) {
		const isInterruptedDate = interruptions.some(
			(interruption) => cursor >= interruption.start && cursor <= interruption.end,
		);

		if (!isInterruptedDate) {
			const inWindow = cursor >= windowStart && cursor <= windowEnd;
			if (inWindow) {
				dates.push(new Date(cursor));
			}
			occurrences += 1;
		}

		if (schedule.occurrences && occurrences >= schedule.occurrences) {
			break;
		}

		// Advance date according to frequency
		switch (schedule.frequency) {
			case 'weekly':
				cursor = addWeeks(cursor, schedule.every);
				break;
			case 'monthly':
				cursor = addMonths(cursor, schedule.every);
				break;
			case 'yearly':
				cursor = addYears(cursor, schedule.every);
				break;
		}
	}

	return dates;
}
