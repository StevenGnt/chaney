import { describe, expect, it } from 'vitest';
import type { Account } from '@/features/forecast/types';
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
					type: 'expense',
					amount: 200,
					schedule: {
						kind: 'single',
						date: '2025-01-10',
					},
				},
			],
		};

		const projection = projectAccountBalance(account, baseRange);

		expect(projection.points).toEqual([
			{ date: '2025-01-01', balance: 1000 },
			{ date: '2025-01-10', balance: 800 },
			{ date: '2025-03-31', balance: 800 },
		]);
	});

	it('handles recurring income with tax and weekly expenses with interruptions', () => {
		const account: Account = {
			...baseAccount,
			transactions: [
				{
					id: 'salary',
					label: 'Salary',
					category: 'income',
					type: 'income',
					amount: 4000,
					taxRate: 0.25,
					schedule: {
						kind: 'recurring',
						frequency: 'monthly',
						startDate: '2025-01-05',
					},
				},
				{
					id: 'groceries',
					label: 'Groceries',
					category: 'food',
					type: 'expense',
					amount: 150,
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
					type: 'income',
					amount: 1000,
					schedule: {
						kind: 'recurring',
						frequency: 'monthly',
						startDate: '2025-01-15',
						occurrences: 2,
					},
				},
			],
		};

		const projection = projectAccountBalance(account, baseRange);
		const occurrencePoints = projection.points.filter((point) =>
			['2025-01-15', '2025-02-15', '2025-03-15'].includes(point.date),
		);

		expect(occurrencePoints).toHaveLength(2);
		const endBalance = projection.points.at(-1)?.balance ?? 0;
		expect(endBalance).toBe(3000);
	});
});
