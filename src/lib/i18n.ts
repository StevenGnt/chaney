import i18n, { type Resource } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

const resources = {
	en: {
		common: {
			APP: {
				TAGLINE: 'Chart your money',
				TITLE: 'Modern personal finance forecasts',
				SUBTITLE:
					'Project every account, simulate new projects, and stay audit-ready with clean dashboards powered by React, TanStack Query, and Recharts.',
				HIGHLIGHTS: {
					PILL: 'Stack highlights',
					TIMELINE: {
						TITLE: 'Forecast horizons',
						DESCRIPTION: 'Switch between presets or custom ranges to stress-test cash.',
					},
					PLAYBOOKS: {
						TITLE: 'Scenario playbooks',
						DESCRIPTION: 'Model one-off purchases, recurring expenses, and tax buffers.',
					},
					QUALITY: {
						TITLE: 'Quality toolchain',
						DESCRIPTION: 'Vite, Vitest, RTL, Storybook, Husky, and GitHub Actions baked in.',
					},
				},
				FOOTER: {
					STATUS: 'MVP foundations ready • Mock data hooked via TanStack Query',
					NEXT_MILESTONE: 'Next: optimized balance engine + interactive chart UI',
				},
			},
			FORECAST: {
				RANGE: {
					TITLE: 'Timeline',
					HINT: 'Pick a preset or define custom dates',
					START: 'From',
					END: 'To',
				},
				HERO: {
					PILL: 'Forecast MVP',
					TITLE: 'Visualize balances, then iterate fast',
					SUBTITLE:
						'Define recurring or one-shot transactions in JSON mocks. The UI will chart balances with Recharts and keep client cache fresh via TanStack Query.',
					PREVIEW_LABEL: 'Coming up next:',
					CHIPS: {
						ACCOUNTS: 'Multi-account timelines',
						BUDGETS: 'Monthly budget view',
						SIMULATIONS: 'Project simulations',
					},
					CTA: 'Open forecast workspace',
				},
				WORKSPACE: {
					PILL: 'Live preview',
					TITLE: 'Money evolution forecast',
					CAPTION: 'From {{start}} to {{end}}',
				},
				STATE: {
					ERROR: 'Unable to load forecast data. Please try again.',
				},
			},
		},
	},
	fr: {
		common: {
			APP: {
				TAGLINE: 'Pilote tes finances',
				TITLE: 'Prévisionnel financier moderne',
				SUBTITLE:
					'Projette chaque compte, simule tes projets et rassure les recruteurs avec un dashboard clair propulsé par React, TanStack Query et Recharts.',
				HIGHLIGHTS: {
					PILL: 'Atouts stack',
					TIMELINE: {
						TITLE: 'Plages temporelles',
						DESCRIPTION: 'Bascule rapidement entre presets ou intervalles custom.',
					},
					PLAYBOOKS: {
						TITLE: 'Scénarios avancés',
						DESCRIPTION: 'Achats ponctuels, dépenses récurrentes et provision taxes.',
					},
					QUALITY: {
						TITLE: 'Qualité intégrée',
						DESCRIPTION: 'Vite, Vitest, RTL, Storybook, Husky et GitHub Actions configurés.',
					},
				},
				FOOTER: {
					STATUS: 'Base MVP prête • Données mockées via TanStack Query',
					NEXT_MILESTONE: 'Prochaine étape : moteur de calcul + graphes interactifs',
				},
			},
			FORECAST: {
				RANGE: {
					TITLE: 'Axe temporel',
					HINT: 'Choisis un preset ou des dates custom',
					START: 'Du',
					END: 'Au',
				},
				HERO: {
					PILL: 'MVP Prévision',
					TITLE: 'Visualise tes soldes et itère vite',
					SUBTITLE:
						'Décris tes transactions récurrentes ou ponctuelles en JSON. L’UI Recharts affichera les courbes et TanStack Query gardera le cache frais.',
					PREVIEW_LABEL: 'À livrer ensuite :',
					CHIPS: {
						ACCOUNTS: 'Chroniques multi-comptes',
						BUDGETS: 'Vue budget mensuel',
						SIMULATIONS: 'Simulations de projets',
					},
					CTA: 'Ouvrir l’atelier de forecast',
				},
				WORKSPACE: {
					PILL: 'Live preview',
					TITLE: 'Projection de trésorerie',
					CAPTION: 'Du {{start}} au {{end}}',
				},
				STATE: {
					ERROR: 'Impossible de charger les données. Merci de réessayer.',
				},
			},
		},
	},
} satisfies Resource;

let initialized = false;

export async function setupI18n() {
	if (initialized) {
		return i18n;
	}

	initialized = true;

	await i18n
		.use(LanguageDetector)
		.use(initReactI18next)
		.init({
			resources,
			fallbackLng: 'en',
			defaultNS: 'common',
			interpolation: {
				escapeValue: false,
			},
			detection: {
				order: ['localStorage', 'navigator', 'htmlTag'],
			},
			supportedLngs: ['en', 'fr'],
		});

	return i18n;
}

export type AppLanguage = keyof typeof resources;
export type AppNamespace = keyof (typeof resources)['en'];
export type AppNamespaceKeys<Namespace extends AppNamespace> =
	Namespace extends keyof (typeof resources)['en']
		? keyof (typeof resources)['en'][Namespace]
		: never;
