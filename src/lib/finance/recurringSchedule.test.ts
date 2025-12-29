import { parseISO } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { RecurringTransaction } from '@/features/ForecastWorkspace/types';

import { generateRecurringOccurrences } from './recurringSchedule';

describe('generateRecurringOccurrences', () => {
	const baseTransaction: RecurringTransaction = {
		id: 'test',
		label: 'Test',
		category: 'Test',
		amount: 100,
		schedule: {
			kind: 'recurring',
			frequency: 'monthly',
			startDate: '2025-01-05',
			interruptions: [],
		},
	};

	describe('monthly transactions', () => {
		it('should generate monthly occurrences within window', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'monthly',
					startDate: '2025-01-05',
					endDate: '2025-12-31',
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-06-30'));

			expect(occurrences).toEqual([
				parseISO('2025-01-05'),
				parseISO('2025-02-05'),
				parseISO('2025-03-05'),
				parseISO('2025-04-05'),
				parseISO('2025-05-05'),
				parseISO('2025-06-05'),
			]);
		});

		it('should handle monthly transaction starting before window', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'monthly',
					startDate: '2024-12-15',
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-02-01'), parseISO('2025-04-30'));

			expect(occurrences).toEqual([parseISO('2025-02-15'), parseISO('2025-03-15'), parseISO('2025-04-15')]);
		});

		it('should handle monthly transaction starting after window', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'monthly',
					startDate: '2025-08-10',
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-06-30'));

			expect(occurrences).toEqual([]);
		});
	});

	describe('weekly transactions', () => {
		it('should generate weekly occurrences within window', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'weekly',
					startDate: '2025-01-07', // Tuesday
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-01-31'));

			expect(occurrences).toEqual([
				parseISO('2025-01-07'),
				parseISO('2025-01-14'),
				parseISO('2025-01-21'),
				parseISO('2025-01-28'),
			]);
		});

		it('should handle weekly transaction starting before window', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'weekly',
					startDate: '2024-12-31', // Tuesday
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-15'), parseISO('2025-01-31'));

			expect(occurrences).toEqual([parseISO('2025-01-21'), parseISO('2025-01-28')]);
		});

		it('should handle weekly transaction starting after window', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'weekly',
					startDate: '2025-02-05',
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-01-31'));

			expect(occurrences).toEqual([]);
		});
	});

	describe('yearly transactions', () => {
		it('should generate yearly occurrences within window', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'yearly',
					startDate: '2023-12-20',
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2027-12-31'));

			expect(occurrences).toEqual([parseISO('2025-12-20'), parseISO('2026-12-20'), parseISO('2027-12-20')]);
		});

		it('should handle yearly transaction starting before window', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'yearly',
					startDate: '2020-06-15',
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2026-12-31'));

			expect(occurrences).toEqual([parseISO('2025-06-15'), parseISO('2026-06-15')]);
		});

		it('should handle yearly transaction starting after window', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'yearly',
					startDate: '2028-03-10',
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2027-12-31'));

			expect(occurrences).toEqual([]);
		});
	});

	describe('interruptions', () => {
		it('should skip occurrences during interruption periods', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'monthly',
					startDate: '2025-01-05',
					interruptions: [
						{
							start: '2025-03-01',
							end: '2025-03-31',
						},
					],
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-06-30'));

			expect(occurrences).toEqual([
				parseISO('2025-01-05'),
				parseISO('2025-02-05'),
				// March 5th is skipped due to interruption
				parseISO('2025-04-05'),
				parseISO('2025-05-05'),
				parseISO('2025-06-05'),
			]);
		});

		it('should handle multiple interruption periods', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'weekly',
					startDate: '2025-01-07', // Tuesday
					interruptions: [
						{
							start: '2025-01-14',
							end: '2025-01-16',
						},
						{
							start: '2025-01-28',
							end: '2025-01-30',
						},
					],
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-02-04'));

			expect(occurrences).toEqual([
				parseISO('2025-01-07'),
				// Jan 14 is skipped
				parseISO('2025-01-21'),
				// Jan 28 is skipped
				parseISO('2025-02-04'),
			]);
		});

		it('should handle interruption without end date', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'monthly',
					startDate: '2025-01-05',
					interruptions: [
						{
							start: '2025-03-01',
							// No end date - should extend to windowEnd
						},
					],
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-06-30'));

			expect(occurrences).toEqual([
				parseISO('2025-01-05'),
				parseISO('2025-02-05'),
				// March through June are all skipped
			]);
		});
	});

	describe('max occurrences', () => {
		it('should limit occurrences to specified count', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'monthly',
					startDate: '2025-01-05',
					occurrences: 3,
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-12-31'));

			expect(occurrences).toEqual([parseISO('2025-01-05'), parseISO('2025-02-05'), parseISO('2025-03-05')]);
		});

		it('should respect max occurrences even if window extends further', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'weekly',
					startDate: '2025-01-07',
					occurrences: 2,
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-12-31'));

			expect(occurrences).toEqual([parseISO('2025-01-07'), parseISO('2025-01-14')]);
		});

		it('should combine max occurrences with interruptions', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'monthly',
					startDate: '2025-01-05',
					occurrences: 4,
					interruptions: [
						{
							start: '2025-02-01',
							end: '2025-02-28',
						},
					],
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-12-31'));

			expect(occurrences).toEqual([
				parseISO('2025-01-05'),
				// Feb 5 is skipped
				parseISO('2025-03-05'),
				parseISO('2025-04-05'),
				parseISO('2025-05-05'),
			]);
		});
	});

	describe('schedule end date', () => {
		it('should stop at schedule end date', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'monthly',
					startDate: '2025-01-05',
					endDate: '2025-04-30',
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-12-31'));

			expect(occurrences).toEqual([
				parseISO('2025-01-05'),
				parseISO('2025-02-05'),
				parseISO('2025-03-05'),
				parseISO('2025-04-05'),
			]);
		});

		it('should respect schedule end date even if window extends further', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'yearly',
					startDate: '2023-06-15',
					endDate: '2025-06-30',
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2024-01-01'), parseISO('2027-12-31'));

			expect(occurrences).toEqual([parseISO('2024-06-15'), parseISO('2025-06-15')]);
		});
	});

	describe('edge cases', () => {
		it('should return empty array when window is before schedule start', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'monthly',
					startDate: '2025-06-05',
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-05-31'));

			expect(occurrences).toEqual([]);
		});

		it('should return empty array when window is after schedule end', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'monthly',
					startDate: '2024-01-05',
					endDate: '2024-12-31',
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-01'), parseISO('2025-12-31'));

			expect(occurrences).toEqual([]);
		});

		it('should handle window exactly matching schedule dates', () => {
			const transaction = {
				...baseTransaction,
				schedule: {
					...baseTransaction.schedule,
					frequency: 'monthly',
					startDate: '2025-01-05',
					endDate: '2025-03-31',
				},
			} satisfies RecurringTransaction;

			const occurrences = generateRecurringOccurrences(transaction, parseISO('2025-01-05'), parseISO('2025-03-31'));

			expect(occurrences).toEqual([parseISO('2025-01-05'), parseISO('2025-02-05'), parseISO('2025-03-05')]);
		});
	});
});
