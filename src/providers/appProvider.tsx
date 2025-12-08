import { QueryClient, QueryClientProvider, keepPreviousData } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';

import type { ReactNode } from 'react';

interface AppProviderProps {
	children: ReactNode;
}

const isDev = import.meta.env.DEV;

const queryClient = new QueryClient({
	defaultOptions: {
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
	},
});

export function AppProvider({ children }: AppProviderProps) {
	return (
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				{children}
				{isDev ? <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} /> : null}
			</QueryClientProvider>
		</StrictMode>
	);
}
