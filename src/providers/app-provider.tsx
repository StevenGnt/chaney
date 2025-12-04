import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/lib/react-query';

interface AppProviderProps {
	children: ReactNode;
}

const isDev = import.meta.env.DEV;

export function AppProvider({ children }: AppProviderProps) {
	const queryClient = getQueryClient();

	return (
		<QueryClientProvider client={queryClient}>
			{children}
			{isDev ? <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} /> : null}
		</QueryClientProvider>
	);
}
