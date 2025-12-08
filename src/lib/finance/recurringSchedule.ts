import { addMonths, addWeeks, addYears, parseISO } from 'date-fns';

import type { RecurrenceFrequency, Transaction } from '@/features/ForecastWorkspace/types';

/**
 * Advances a date by the specified frequency and interval multiplier.
 *
 * @param date - Current date to advance from.
 * @param frequency - Recurrence frequency (weekly, monthly, or yearly).
 * @param every - Number of frequency units to advance (e.g., every 2 weeks).
 * @returns The advanced date.
 */
export function advanceDate(date: Date, frequency: RecurrenceFrequency, every: number): Date {
	switch (frequency) {
		case 'weekly':
			return addWeeks(date, every);
		case 'monthly':
			return addMonths(date, every);
		case 'yearly':
			return addYears(date, every);
	}
}

/**
 * Checks if a date falls within any of the provided interruption windows.
 *
 * @param date - Date to check.
 * @param windows - Array of interruption periods, each with start and end dates.
 * @returns True if the date is within any interruption window, false otherwise.
 */
export function isInterrupted(date: Date, windows: { start: Date; end: Date }[]): boolean {
	return windows.some((window) => date >= window.start && date <= window.end);
}

export interface RecurringScheduleOptions {
	accountStart: Date;
	windowStart: Date;
	windowEnd: Date;
}

/**
 * Generates all occurrence dates for a recurring transaction schedule within a given window.
 *
 * Handles:
 * - Schedule start/end dates
 * - Account start date constraints
 * - Interruptions
 * - Occurrence limits
 * - Date advancement by frequency
 *
 * @param transaction - Transaction with a recurring schedule.
 * @param options - Options including account start and window boundaries.
 * @returns Array of occurrence dates within the window.
 */
export function generateRecurringOccurrences(transaction: Transaction, options: RecurringScheduleOptions): Date[] {
	if (transaction.schedule.kind !== 'recurring') {
		return [];
	}

	const schedule = transaction.schedule;
	const scheduleStart = parseISO(schedule.startDate);
	const scheduleEnd = schedule.endDate ? parseISO(schedule.endDate) : options.windowEnd;
	const maxEnd = new Date(Math.min(scheduleEnd.getTime(), options.windowEnd.getTime()));
	const startDate = new Date(Math.max(options.accountStart.getTime(), scheduleStart.getTime()));

	// No valid range if start is after max end
	if (startDate > maxEnd) {
		return [];
	}

	// Convert interruption periods to Date objects for comparison
	const interruptions = schedule.interruptions.map((period) => ({
		start: parseISO(period.start),
		end: period.end ? parseISO(period.end) : options.windowEnd,
	}));

	const dates: Date[] = [];
	let occurrences = 0;
	let cursor = new Date(startDate);

	while (cursor.getTime() <= maxEnd.getTime()) {
		const isInterruptedDate = isInterrupted(cursor, interruptions);

		if (!isInterruptedDate) {
			const inWindow = cursor >= options.windowStart && cursor <= options.windowEnd;
			if (inWindow) {
				dates.push(new Date(cursor));
			}
			occurrences += 1;
		}

		// Stop if we've reached the maximum number of occurrences
		if (schedule.occurrences && occurrences >= schedule.occurrences) {
			break;
		}

		// Advance to the next occurrence date
		cursor = advanceDate(cursor, schedule.frequency, schedule.every);
	}

	return dates;
}
