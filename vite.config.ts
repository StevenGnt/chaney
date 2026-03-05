import fs from 'node:fs';
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Vite plugin that intercepts requests to `/finance-data.json` and serves
 * the personal data file if it exists, otherwise falls back to the example data.
 */
function financeDataPlugin(): Plugin {
	return {
		name: 'finance-data-plugin',
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (req.method === 'GET' && req.url?.startsWith('/finance-data.json')) {
					const publicDir = path.resolve(__dirname, 'public');
					const personalFile = path.join(publicDir, 'finance-data.json');
					const exampleFile = path.join(publicDir, 'finance-data.example.json');

					// Check if personal file exists, otherwise use example
					const filePath = fs.existsSync(personalFile) ? personalFile : exampleFile;

					if (fs.existsSync(filePath)) {
						const data = fs.readFileSync(filePath, 'utf-8');
						res.setHeader('Content-Type', 'application/json');
						res.end(data);
						return;
					}
				}
				next();
			});
		},
	};
}

export default defineConfig({
	plugins: [react(), tailwindcss(), financeDataPlugin()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'lcov'],
		},
	},
});
