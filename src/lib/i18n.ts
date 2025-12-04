import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCommon from '../../public/locales/en/common.json';
import frCommon from '../../public/locales/fr/common.json';

const resources = {
	en: {
		common: enCommon,
	},
	fr: {
		common: frCommon,
	},
} as const;

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
