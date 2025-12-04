import { QueryClient, isServer, keepPreviousData } from '@tanstack/react-query';

const defaultOptions = {
	queries: {
		staleTime: 1000 * 60, // 1 minute
		gcTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
		refetchOnReconnect: true,
		retry: 1,
		placeholderData: keepPreviousData,
	},
	mutations: {
		retry: 0,
	},
} satisfies Parameters<typeof QueryClient>[0]['defaultOptions'];

function createClient() {
	return new QueryClient({
		defaultOptions,
	});
}

let queryClient: QueryClient | undefined;

export function getQueryClient() {
	if (isServer) {
		return createClient();
	}

	queryClient ??= createClient();

	return queryClient;
}
