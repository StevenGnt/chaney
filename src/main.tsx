import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/app';
import { AppProvider } from '@/providers/app-provider';
import { setupI18n } from '@/lib/i18n';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Root element not found');
}

setupI18n()
	.then(() => {
		createRoot(rootElement).render(
			<StrictMode>
				<AppProvider>
					<App />
				</AppProvider>
			</StrictMode>,
		);
	})
	.catch((error: unknown) => {
		console.error('Failed to initialize i18n', error);
	});
