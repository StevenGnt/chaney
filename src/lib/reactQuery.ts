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

/**
 * Creates a new `QueryClient` instance configured with the app defaults.
 *
 * @returns A fresh `QueryClient`.
 */
function createClient() {
	return new QueryClient({
		defaultOptions,
	});
}

let queryClient: QueryClient | undefined;

/**
 * Returns a shared `QueryClient` instance on the client and a new one on the server.
 *
 * On the server this avoids sharing state between requests, while on the client it
 * lazily initializes and memoizes a singleton instance.
 *
 * @returns A `QueryClient` ready to be used with React Query hooks and providers.
 */
export function getQueryClient() {
	if (isServer) {
		return createClient();
	}

	queryClient ??= createClient();

	return queryClient;
}
