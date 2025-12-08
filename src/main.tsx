import { createRoot } from 'react-dom/client';

import App from '@/app/app';
import { setupI18n } from '@/lib/i18n';
import { AppProvider } from '@/providers/appProvider';
import './index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Root element not found');
}

setupI18n()
	.then(() => {
		createRoot(rootElement).render(
			<AppProvider>
				<App />
			</AppProvider>,
		);
	})
	.catch((error: unknown) => {
		console.error('Failed to initialize i18n', error);
	});
