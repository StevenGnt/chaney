import { addMonths, addWeeks, addYears, parseISO } from 'date-fns';

import type { RecurringTransaction } from '@/features/ForecastWorkspace/types';

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

/**
 * Generates all occurrence dates for a recurring transaction schedule within a given window.
 *
 * Handles:
 * - Schedule start/end dates
 * - Interruptions
 * - Occurrence limits
 * - Date advancement by frequency
 *
 * The recurring pattern always starts from the schedule's start date to maintain the pattern
 * (e.g., monthly on the 5th will always be the 5th of each month, not shifted by window boundaries).
 *
 * @param transaction - Transaction with a recurring schedule.
 * @param windowStart - Start date of the window (inclusive).
 * @param windowEnd - End date of the window (inclusive).
 * @returns Array of occurrence dates within the window.
 */
export function generateRecurringOccurrences(
	transaction: RecurringTransaction,
	windowStart: Date,
	windowEnd: Date,
): Date[] {
	const schedule = transaction.schedule;
	const scheduleStart = parseISO(schedule.startDate);
	const scheduleEnd = schedule.endDate ? parseISO(schedule.endDate) : null;
	const maxOccurrences = schedule.occurrences ?? Infinity;

	// Convert interruption periods to Date objects for comparison
	const interruptions = schedule.interruptions.map((period) => ({
		start: parseISO(period.start),
		end: period.end ? parseISO(period.end) : windowEnd,
	}));

	const dates: Date[] = [];
	let occurrences = 0;
	// Always start from scheduleStart to maintain the recurring pattern
	let cursor = new Date(scheduleStart);

	// Continue until we've hit maxOccurrences or passed all relevant boundaries
	while (occurrences < maxOccurrences && (!scheduleEnd || cursor <= scheduleEnd) && cursor <= windowEnd) {
		const isInterruptedDate = isInterrupted(cursor, interruptions);

		if (!isInterruptedDate) {
			// Only include dates within the window (windowEnd is already checked in while condition)
			if (cursor >= windowStart) {
				dates.push(new Date(cursor));
				occurrences++;
			}
		}

		// Advance to the next occurrence date
		switch (schedule.frequency) {
			case 'weekly':
				cursor = addWeeks(cursor, 1);
				break;
			case 'monthly':
				cursor = addMonths(cursor, 1);
				break;
			case 'yearly':
				cursor = addYears(cursor, 1);
				break;
		}
	}

	return dates;
}
