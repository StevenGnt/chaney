import { describe, expect, it } from 'vitest';

import type { Account } from '@/features/ForecastWorkspace/types';

import { projectAccountBalance } from './projection';

const baseAccount: Account = {
	id: 'acc',
	name: 'Test Account',
	currency: 'EUR',
	initialBalance: 1000,
	initialDate: '2025-01-01',
	transactions: [],
};

const baseRange = { start: '2025-01-01', end: '2025-03-31' };

describe('projectAccountBalance', () => {
	it('keeps chronological points and applies single transactions', () => {
		const account: Account = {
			...baseAccount,
			transactions: [
				{
					id: 'one-off',
					label: 'One time purchase',
					category: 'gear',
					amount: -200,
					schedule: {
						kind: 'single',
						date: '2025-01-10',
					},
				},
			],
		};

		const projection = projectAccountBalance(account, baseRange);

		// Should have points for every day in the range
		expect(projection.points.length).toBe(90); // Jan 1 to Mar 31 = 90 days
		expect(projection.points[0]).toEqual({ date: '2025-01-01', balance: 1000 });
		expect(projection.points[9]).toEqual({ date: '2025-01-10', balance: 800 });
		expect(projection.points[projection.points.length - 1]).toEqual({ date: '2025-03-31', balance: 800 });
	});

	it('handles recurring income with tax and weekly expenses with interruptions', () => {
		const account: Account = {
			...baseAccount,
			transactions: [
				{
					id: 'salary',
					label: 'Salary',
					category: 'income',
					amount: 4000,
					taxRate: 0.25,
					schedule: {
						kind: 'recurring',
						frequency: 'monthly',
						startDate: '2025-01-05',
						interruptions: [],
					},
				},
				{
					id: 'groceries',
					label: 'Groceries',
					category: 'food',
					amount: -150,
					schedule: {
						kind: 'recurring',
						frequency: 'weekly',
						startDate: '2025-01-02',
						interruptions: [{ start: '2025-02-10', end: '2025-02-20' }],
					},
				},
			],
		};

		const projection = projectAccountBalance(account, baseRange);

		const lastPoint = projection.points.at(-1);
		expect(lastPoint?.date).toBe('2025-03-31');
		expect(lastPoint?.balance).toBeGreaterThan(1000);
		expect(projection.points.filter((point) => point.date.startsWith('2025-02')).length).toBeGreaterThan(0);
	});

	it('stops recurring schedules after reaching the occurrence limit', () => {
		const account: Account = {
			...baseAccount,
			transactions: [
				{
					id: 'limited',
					label: 'Limited stipend',
					category: 'income',
					amount: 1000,
					schedule: {
						kind: 'recurring',
						frequency: 'monthly',
						startDate: '2025-01-15',
						occurrences: 2,
						interruptions: [],
					},
				},
			],
		};

		const projection = projectAccountBalance(account, baseRange);

		// Check that we have points for the occurrence dates
		const jan15Point = projection.points.find((p) => p.date === '2025-01-15');
		const feb15Point = projection.points.find((p) => p.date === '2025-02-15');
		const mar15Point = projection.points.find((p) => p.date === '2025-03-15');

		expect(jan15Point).toBeDefined();
		expect(feb15Point).toBeDefined();
		expect(mar15Point).toBeDefined();

		// Should have 2 occurrences (Jan 15 and Feb 15), not Mar 15
		expect(jan15Point?.balance).toBe(2000);
		expect(feb15Point?.balance).toBe(3000);
		expect(mar15Point?.balance).toBe(3000); // No change after Feb 15

		const endBalance = projection.points.at(-1)?.balance ?? 0;
		expect(endBalance).toBe(3000);
	});

	it('handles multiple transactions on the same day', () => {
		const account: Account = {
			...baseAccount,
			transactions: [
				{
					id: 'income1',
					label: 'Income 1',
					category: 'income',
					amount: 500,
					schedule: {
						kind: 'single',
						date: '2025-01-15',
					},
				},
				{
					id: 'income2',
					label: 'Income 2',
					category: 'income',
					amount: 300,
					schedule: {
						kind: 'single',
						date: '2025-01-15',
					},
				},
				{
					id: 'expense',
					label: 'Expense',
					category: 'expense',
					amount: -100,
					schedule: {
						kind: 'single',
						date: '2025-01-15',
					},
				},
			],
		};

		const projection = projectAccountBalance(account, baseRange);

		// Before Jan 15: 1000
		const jan14Point = projection.points.find((p) => p.date === '2025-01-14');
		expect(jan14Point?.balance).toBe(1000);

		// On Jan 15: 1000 + 500 + 300 - 100 = 1700
		const jan15Point = projection.points.find((p) => p.date === '2025-01-15');
		expect(jan15Point?.balance).toBe(1700);

		// After Jan 15: still 1700
		const jan16Point = projection.points.find((p) => p.date === '2025-01-16');
		expect(jan16Point?.balance).toBe(1700);
	});
});
