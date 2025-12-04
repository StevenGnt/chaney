import { describe, expect, it } from 'vitest';
import type { AccountProjection } from '@/lib/finance/projection';
import { buildChartDataset } from './build-chart-dataset';

const sampleProjections: AccountProjection[] = [
	{
		accountId: 'checking',
		points: [
			{ date: '2025-01-01', balance: 1000 },
			{ date: '2025-01-10', balance: 800 },
			{ date: '2025-01-31', balance: 1200 },
		],
	},
	{
		accountId: 'savings',
		points: [
			{ date: '2025-01-01', balance: 5000 },
			{ date: '2025-01-20', balance: 5200 },
			{ date: '2025-01-31', balance: 5400 },
		],
	},
];

describe('buildChartDataset', () => {
	it('merges points by date and forward-fills gaps', () => {
		const rows = buildChartDataset(sampleProjections);
		expect(rows).toHaveLength(4);
		expect(rows[1]).toEqual({
			date: '2025-01-10',
			checking: 800,
			savings: 5000,
		});
	});

	it('filters accounts when selection is provided', () => {
		const rows = buildChartDataset(sampleProjections, ['savings']);
		expect(rows[0]).toEqual({
			date: '2025-01-01',
			savings: 5000,
		});
	});
});
