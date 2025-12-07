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

// Parse and validate the raw JSON data once at module load time
const parsedData = financeMockSchema.parse(rawData);

/**
 * Fetches mock finance data with simulated latency.
 *
 * The data is pre-parsed and validated at module load time, so this function
 * only simulates an async fetch operation.
 *
 * @returns A promise resolving to validated finance mock data.
 */
export async function fetchMockFinance(): Promise<FinanceMock> {
	await simulateLatency();
	return parsedData;
}
