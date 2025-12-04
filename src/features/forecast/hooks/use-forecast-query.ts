import { useQuery } from '@tanstack/react-query';
import { fetchMockFinance } from '@/mocks/mock-service';
import { projectAccounts, type AccountProjection, type ForecastRange } from '@/lib/finance/projection';
import type { FinanceMock } from '@/features/forecast/types';

export type ForecastQueryResult = FinanceMock & {
	projections: AccountProjection[];
};

export function useForecastQuery(range: ForecastRange) {
	return useQuery<ForecastQueryResult>({
		queryKey: ['forecast', range.start, range.end],
		queryFn: async () => {
			const data = await fetchMockFinance();
			const projections = projectAccounts(data.accounts, range);
			return { ...data, projections };
		},
		staleTime: 1000 * 60 * 5,
	});
}
