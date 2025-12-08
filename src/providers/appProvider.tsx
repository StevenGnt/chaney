import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { StrictMode } from 'react';

import { getQueryClient } from '@/lib/reactQuery';
import type { ReactNode } from 'react';

interface AppProviderProps {
	children: ReactNode;
}

const isDev = import.meta.env.DEV;

export function AppProvider({ children }: AppProviderProps) {
	const queryClient = getQueryClient();

	return (
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				{children}
				{isDev ? <ReactQueryDevtools buttonPosition="bottom-left" initialIsOpen={false} /> : null}
			</QueryClientProvider>
		</StrictMode>
	);
}
