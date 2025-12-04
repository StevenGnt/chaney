import { ForecastWorkspace } from '@/features/forecast/components/ForecastWorkspace';
import { useTranslation } from 'react-i18next';

const HIGHLIGHTS = [
	{
		titleKey: 'APP.HIGHLIGHTS.TIMELINE.TITLE',
		descriptionKey: 'APP.HIGHLIGHTS.TIMELINE.DESCRIPTION',
	},
	{
		titleKey: 'APP.HIGHLIGHTS.PLAYBOOKS.TITLE',
		descriptionKey: 'APP.HIGHLIGHTS.PLAYBOOKS.DESCRIPTION',
	},
	{
		titleKey: 'APP.HIGHLIGHTS.QUALITY.TITLE',
		descriptionKey: 'APP.HIGHLIGHTS.QUALITY.DESCRIPTION',
	},
] as const;

export function App() {
	const { t } = useTranslation();

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-4 py-10 sm:px-6 lg:px-8">
				<header className="space-y-4">
					<p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-400">
						{t('APP.TAGLINE')}
					</p>
					<div className="space-y-3">
						<h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-5xl">
							{t('APP.TITLE')}
						</h1>
						<p className="text-base text-slate-300 sm:text-lg lg:w-4/5">{t('APP.SUBTITLE')}</p>
					</div>
				</header>

				<main className="grid gap-6 lg:grid-cols-[3fr_2fr]">
					<ForecastWorkspace />

					<aside className="space-y-4 rounded-2xl border border-white/5 bg-white/5 p-6 shadow-2xl shadow-emerald-500/10 backdrop-blur">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
							{t('APP.HIGHLIGHTS.PILL')}
						</p>
						<ul className="space-y-4">
							{HIGHLIGHTS.map(({ titleKey, descriptionKey }) => (
								<li key={titleKey} className="space-y-1">
									<p className="text-base font-semibold text-white">{t(titleKey)}</p>
									<p className="text-sm text-slate-300">{t(descriptionKey)}</p>
								</li>
							))}
						</ul>
					</aside>
				</main>

				<footer className="border-t border-white/5 pt-6 text-xs text-slate-400 sm:flex sm:items-center sm:justify-between">
					<p>{t('APP.FOOTER.STATUS')}</p>
					<p>{t('APP.FOOTER.NEXT_MILESTONE')}</p>
				</footer>
			</div>
		</div>
	);
}

export default App;
