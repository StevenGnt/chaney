import { addMonths, addWeeks, addYears, formatISO, parseISO } from 'date-fns';

import type { Account, DateRange, RecurrenceFrequency, Transaction } from '@/features/ForecastWorkspace/types';

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

interface TransactionEvent {
	timestamp: number;
	date: string;
	amount: number;
}

const ISO_OPTIONS = { representation: 'date' } as const;

// Inline function to build date key from a Date object
const toDateKey = (date: Date) => formatISO(date, ISO_OPTIONS);

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
	const effectiveStart = accountStart > forecastStart ? accountStart : forecastStart;

	const events = buildTransactionsEvents(account, {
		start: account.initialDate,
		end: range.end,
	});

	let cursor = 0;
	let balance = account.initialBalance;

	// Compute balance at the start of the forecast if account initial date is before forecast start
	while (cursor < events.length && events[cursor].timestamp < effectiveStart.getTime()) {
		balance += events[cursor].amount;
		cursor += 1;
	}

	const points: BalancePoint[] = [
		{
			date: toDateKey(effectiveStart),
			balance,
		},
	];

	for (; cursor < events.length; cursor += 1) {
		const event = events[cursor];
		if (event.timestamp > forecastEnd.getTime()) {
			break;
		}

		balance += event.amount;

		upsertPoint(points, event.date, balance);
	}

	const finalDate = toDateKey(forecastEnd);
	if (points[points.length - 1]?.date !== finalDate) {
		points.push({ date: finalDate, balance });
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
 * @returns A chronologically sorted list of transaction events.
 */
function buildTransactionsEvents(account: Account, window: ForecastRange): TransactionEvent[] {
	const rangeStart = parseISO(window.start);
	const rangeEnd = parseISO(window.end);
	const events: TransactionEvent[] = [];

	for (const transaction of account.transactions) {
		const base = transaction.amount;

		if (base === 0) {
			continue;
		}

		// Only apply tax to positive amounts (income)
		const amount = base > 0 && transaction.taxRate ? +(base * (1 - transaction.taxRate)).toFixed(2) : base;

		// Collect events for this transaction
		const transactionEvents: TransactionEvent[] = [];

		switch (transaction.schedule.kind) {
			case 'single': {
				const occurrence = parseISO(transaction.schedule.date);
				if (occurrence >= rangeStart && occurrence <= rangeEnd && occurrence >= parseISO(account.initialDate)) {
					transactionEvents.push(createEvent(occurrence, amount));
				}
				break;
			}
			case 'recurring': {
				const occurrences = expandRecurringSchedule(transaction, account.initialDate, window);
				for (const occurrence of occurrences) {
					transactionEvents.push(createEvent(occurrence, amount));
				}
				break;
			}
		}

		// Push all events for this transaction at once
		events.push(...transactionEvents);
	}

	return events.sort((left, right) => left.timestamp - right.timestamp);
}

/**
 * Creates a `TransactionEvent` object from a date and an amount.
 *
 * @param date - Occurrence date of the transaction.
 * @param amount - Signed amount to apply on that date.
 * @returns A `TransactionEvent` including timestamp, ISO date and amount.
 */
function createEvent(date: Date, amount: number): TransactionEvent {
	return {
		timestamp: date.getTime(),
		date: toDateKey(date),
		amount,
	};
}

/**
 * Expands a recurring transaction schedule into concrete occurrence dates within a window.
 *
 * @param transaction - Transaction with a recurring schedule.
 * @param accountStartISO - ISO date at which the account becomes active.
 * @param window - Forecast window limiting the occurrences to consider.
 * @returns An array of occurrence dates for the schedule within the window.
 */
function expandRecurringSchedule(transaction: Transaction, accountStartISO: string, window: ForecastRange) {
	const schedule = transaction.schedule;
	if (schedule.kind !== 'recurring') {
		return [];
	}

	const every = schedule.every;
	const accountStart = parseISO(accountStartISO);
	const scheduleStart = parseISO(schedule.startDate);
	const startDate = accountStart > scheduleStart ? accountStart : scheduleStart;
	const windowStart = parseISO(window.start);
	const windowEnd = parseISO(window.end);
	const scheduleEnd = schedule.endDate ? parseISO(schedule.endDate) : windowEnd;
	const maxEnd = scheduleEnd < windowEnd ? scheduleEnd : windowEnd;

	if (startDate > maxEnd) {
		return [];
	}

	const interruptions = schedule.interruptions.map((period) => ({
		start: parseISO(period.start),
		end: period.end ? parseISO(period.end) : windowEnd,
	}));

	const dates: Date[] = [];
	let occurrences = 0;
	let cursor = startDate;

	while (cursor <= maxEnd) {
		if (!isInterrupted(cursor, interruptions)) {
			const inWindow = cursor >= windowStart && cursor <= windowEnd;
			if (inWindow) {
				dates.push(new Date(cursor));
			}
		}

		occurrences += 1;
		if (schedule.occurrences && occurrences >= schedule.occurrences) {
			break;
		}

		cursor = advanceDate(cursor, schedule.frequency, every);
	}

	return dates;
}

/**
 * Advances a date according to a recurrence frequency and interval.
 *
 * @param date - Current occurrence date.
 * @param frequency - Recurrence frequency (weekly, monthly, yearly).
 * @param every - Interval multiplier for the frequency.
 * @returns The next occurrence date.
 */
function advanceDate(date: Date, frequency: RecurrenceFrequency, every: number) {
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
 * Checks whether a date falls into any interruption window.
 *
 * @param date - Date to check.
 * @param windows - List of interruption periods expressed as date ranges.
 * @returns `true` if the date is within an interruption window, otherwise `false`.
 */
function isInterrupted(date: Date, windows: { start: Date; end: Date }[]) {
	return windows.some((window) => date >= window.start && date <= window.end);
}

/**
 * Inserts or updates a balance point for a given date in a time series.
 *
 * @param points - Existing list of balance points, assumed sorted by date.
 * @param date - ISO date for the balance point.
 * @param balance - Balance value to store for the date.
 */
function upsertPoint(points: BalancePoint[], date: string, balance: number) {
	const last = points[points.length - 1];
	if (last.date === date) {
		last.balance = balance;
		return;
	}

	points.push({ date, balance });
}
