import { addMonths, differenceInMonths, formatISO, parseISO } from 'date-fns';
import type { ForecastRange } from '@/lib/finance/projection';

export interface RangePreset {
	id: string;
	label: string;
	months: number;
}

/**
 * Creates a `ForecastRange` starting at a given ISO date and spanning a number of months.
 *
 * @param startISO - Start date in ISO 8601 format.
 * @param months - Number of months to include in the range.
 * @returns A `ForecastRange` with ISO start and end dates.
 */
export function createRangeFromMonths(startISO: string, months: number): ForecastRange {
	const start = parseISO(startISO);
	const end = addMonths(start, months);

	return {
		start: formatISO(start, { representation: 'date' }),
		end: formatISO(end, { representation: 'date' }),
	};
}

/**
 * Computes the number of months covered by a `ForecastRange`, with a minimum of 1.
 *
 * @param range - Range whose duration to measure.
 * @returns The number of full months between start and end, at least 1.
 */
export function getMonthsInRange(range: ForecastRange) {
	return Math.max(1, differenceInMonths(parseISO(range.end), parseISO(range.start)));
}
