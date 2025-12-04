import { addMonths, differenceInMonths, formatISO, parseISO } from 'date-fns';
import type { ForecastRange } from '@/lib/finance/projection';

export interface RangePreset {
	id: string;
	label: string;
	months: number;
}

export function createRangeFromMonths(startISO: string, months: number): ForecastRange {
	const start = parseISO(startISO);
	const end = addMonths(start, months);

	return {
		start: formatISO(start, { representation: 'date' }),
		end: formatISO(end, { representation: 'date' }),
	};
}

export function getMonthsInRange(range: ForecastRange) {
	return Math.max(1, differenceInMonths(parseISO(range.end), parseISO(range.start)));
}
