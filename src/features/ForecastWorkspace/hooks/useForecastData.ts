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
 * @param selectedAccountIds - Array of account IDs to filter by. Empty array means all accounts.
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

		// Filter accounts based on selection
		const filteredAccounts =
			selectedAccountIds.length > 0
				? allAccounts.filter((account) => selectedAccountIds.includes(account.id))
				: allAccounts;

		// Filter projections based on selected accounts
		const filteredProjections =
			selectedAccountIds.length > 0
				? queryResult.projections.filter((projection) => selectedAccountIds.includes(projection.accountId))
				: queryResult.projections;

		// Get selected accounts (for display purposes)
		const selectedAccounts =
			selectedAccountIds.length > 0
				? allAccounts.filter((account) => selectedAccountIds.includes(account.id))
				: allAccounts;

		return {
			filteredAccounts,
			filteredProjections,
			selectedAccounts,
			allAccounts,
			thresholds: queryResult.thresholds,
		};
	}, [queryResult, selectedAccountIds]);
}
