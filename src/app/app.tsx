import { ForecastWorkspace } from '@/features/ForecastWorkspace/ForecastWorkspace';
import { useTranslation } from 'react-i18next';

export function App() {
	const { t } = useTranslation();

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6 lg:px-8">
				<header className="space-y-4">
					<p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">{t('APP.TAGLINE')}</p>
					<div className="space-y-3">
						<h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">{t('APP.TITLE')}</h1>
					</div>
				</header>

				<ForecastWorkspace />

				<footer className="border-t border-white/5 pt-6 text-xs text-slate-400 sm:flex sm:items-center sm:justify-between">
					<p>{t('APP.FOOTER.MADE_WITH')} React · TypeScript · Vite · TanStack Query · Recharts</p>
					<p>{t('APP.FOOTER.STATUS')}</p>
				</footer>
			</div>
		</div>
	);
}

export default App;
