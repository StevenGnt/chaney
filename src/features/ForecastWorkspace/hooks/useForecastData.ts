import { useMemo } from 'react';

import type { ForecastQueryResult } from './useForecastQuery';
import type { Account } from '@/features/ForecastWorkspace/types';
import type { AccountProjection } from '@/lib/finance/projection';

interface UseForecastDataParams {
	queryResult: ForecastQueryResult | undefined;
	selectedAccountIds: string[];
}

interface UseForecastDataReturn {
	filteredAccounts: Account[];
	filteredProjections: AccountProjection[];
	selectedAccounts: Account[];
	allAccounts: Account[];
	thresholds: ForecastQueryResult['thresholds'];
}

/**
 * Centralized hook for filtering forecast data based on user selections.
 *
 * Filters accounts and projections based on selected account IDs.
 * Returns filtered domain models ready for transformation to UI-specific formats.
 *
 * @param queryResult - The forecast query result containing accounts, projections, and thresholds.
 * @param selectedAccountIds - Array of account IDs to filter by. Empty array means no accounts selected (empty results).
 * @returns Filtered accounts, projections, and related data.
 */
export function useForecastData({ queryResult, selectedAccountIds }: UseForecastDataParams): UseForecastDataReturn {
	return useMemo(() => {
		if (!queryResult) {
			return {
				filteredAccounts: [],
				filteredProjections: [],
				selectedAccounts: [],
				allAccounts: [],
				thresholds: [],
			};
		}

		const allAccounts = queryResult.accounts;
		const hasSelection = selectedAccountIds.length > 0;

		// Initialize return value
		const result: UseForecastDataReturn = {
			filteredAccounts: [],
			filteredProjections: [],
			selectedAccounts: [],
			allAccounts,
			thresholds: queryResult.thresholds,
		};

		// Filter based on selection (only if accounts are selected)
		if (hasSelection) {
			result.filteredAccounts = allAccounts.filter((account) => selectedAccountIds.includes(account.id));
			result.filteredProjections = queryResult.projections.filter((projection) =>
				selectedAccountIds.includes(projection.accountId),
			);
			result.selectedAccounts = allAccounts.filter((account) => selectedAccountIds.includes(account.id));
		}

		return result;
	}, [queryResult, selectedAccountIds]);
}
