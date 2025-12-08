import type { AccountProjection } from '@/lib/finance/projection';

export interface ChartDatum {
	date: string;
	[accountId: string]: string | number | null;
}

/**
 * Builds a chart-friendly dataset from account projections.
 *
 * Each row corresponds to a date and contains a column per account id. Missing values for
 * active accounts are forward-filled so chart lines remain continuous.
 *
 * @param projections - Array of account projections with balance points over time.
 * @returns Array of chart data points with dates and account balances.
 */
export function buildChartDataset(projections: AccountProjection[]): ChartDatum[] {
	const rows = new Map<string, ChartDatum>();

	for (const projection of projections) {
		for (const point of projection.points) {
			const existing = rows.get(point.date) ?? { date: point.date };
			existing[projection.accountId] = point.balance;
			rows.set(point.date, existing);
		}
	}

	const sortedRows = [...rows.values()].sort((a, b) => a.date.localeCompare(b.date));

	// Forward-fill missing values for each account
	const accountIds = projections.map((p) => p.accountId);
	for (const accountId of accountIds) {
		let lastValue: number | null = null;
		for (const row of sortedRows) {
			const rawValue = row[accountId];
			const numericValue = typeof rawValue === 'number' ? rawValue : null;
			if (numericValue !== null) {
				lastValue = numericValue;
			} else {
				row[accountId] = lastValue;
			}
		}
	}

	return sortedRows;
}
