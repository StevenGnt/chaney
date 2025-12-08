import { financeMockSchema, type FinanceMock } from '@/features/ForecastWorkspace/types';
import rawData from '@/mocks/finance-data.json';

/**
 * Simulates network latency by delaying execution for a specified duration.
 *
 * @param duration - Delay in milliseconds, defaults to 150ms.
 * @returns A promise that resolves after the delay.
 */
function simulateLatency(duration = 150) {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
}

/**
 * Fetches mock finance data with simulated latency.
 *
 * Validates the data against the schema before returning, matching the pattern
 * of a real API service where responses would be validated.
 *
 * @returns A promise resolving to validated finance mock data.
 */
export async function fetchMockFinance(): Promise<FinanceMock> {
	await simulateLatency();

	// Validate the data (matches real API pattern)
	return financeMockSchema.parse(rawData);
}
