import type { AccountProjection } from '@/lib/finance/projection';

export interface ChartDatum {
	date: string;
	[accountId: string]: string | number | null;
}

/**
 * Builds a chart-friendly dataset from raw account projections, optionally filtering by accounts.
 *
 * Each row corresponds to a date and contains a column per account id. Missing values for
 * active accounts are forward-filled so chart lines remain continuous.
 *
 * @param projections - List of account balance projections.
 * @param selectedAccountIds - Optional subset of account ids to include in the dataset.
 * @returns An array of chart data rows sorted by date.
 */
export function buildChartDataset(projections: AccountProjection[], selectedAccountIds?: string[]): ChartDatum[] {
	const activeIds =
		selectedAccountIds && selectedAccountIds.length > 0
			? selectedAccountIds
			: projections.map((projection) => projection.accountId);

	const rows = new Map<string, ChartDatum>();

	for (const projection of projections) {
		if (!activeIds.includes(projection.accountId)) {
			continue;
		}

		for (const point of projection.points) {
			const existing = rows.get(point.date) ?? { date: point.date };
			existing[projection.accountId] = point.balance;
			rows.set(point.date, existing);
		}
	}

	const sortedRows = [...rows.values()].sort((a, b) => a.date.localeCompare(b.date));

	for (const accountId of activeIds) {
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
