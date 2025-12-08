import { financeMockSchema, type FinanceMock } from '@/features/ForecastWorkspace/types';

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
 * Loads data from `/finance-data.json`, which is handled by the Vite plugin.
 * The plugin automatically serves personal data if available, otherwise falls back
 * to the example data. This keeps personal data private and out of git.
 *
 * Validates the data against the schema before returning, matching the pattern
 * of a real API service where responses would be validated.
 *
 * @returns A promise resolving to validated finance mock data.
 */
export async function fetchMockFinance(): Promise<FinanceMock> {
	await simulateLatency();

	const response = await fetch('/finance-data.json');
	if (!response.ok) {
		throw new Error(`Failed to fetch finance data: ${response.statusText}`);
	}

	const rawData = (await response.json()) as unknown;

	// Validate the data (matches real API pattern)
	return financeMockSchema.parse(rawData);
}
