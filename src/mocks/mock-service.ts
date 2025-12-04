import rawData from '@/mocks/finance-data.json';
import { financeMockSchema, type FinanceMock } from '@/features/forecast/types';

function simulateLatency(duration = 150) {
	return new Promise((resolve) => {
		setTimeout(resolve, duration);
	});
}

const parsedData = financeMockSchema.parse(rawData);

export async function fetchMockFinance(): Promise<FinanceMock> {
	await simulateLatency();
	return parsedData;
}
