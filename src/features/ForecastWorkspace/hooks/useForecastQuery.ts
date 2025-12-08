import { useQuery } from '@tanstack/react-query';

import type { FinanceMock } from '@/features/ForecastWorkspace/types';
import { projectAccountBalance, type AccountProjection, type ForecastRange } from '@/lib/finance/projection';
import { fetchMockFinance } from '@/mocks/mockService';

export type ForecastQueryResult = FinanceMock & {
	projections: AccountProjection[];
};

/**
 * React Query hook that fetches mock finance data and computes account projections for a range.
 *
 * @param range - Inclusive forecast range used both for the query key and for computing projections.
 * @returns A React Query result containing raw mock data and derived projections.
 */
export function useForecastQuery(range: ForecastRange) {
	return useQuery<ForecastQueryResult>({
		queryKey: ['forecast', range.start, range.end],
		queryFn: async () => {
			const data = await fetchMockFinance();
			const projections = data.accounts.map((account) => projectAccountBalance(account, range));
			return { ...data, projections };
		},
		staleTime: 1000 * 60 * 5,
	});
}
