import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import enCommon from '../../public/locales/en/common.json';
import frCommon from '../../public/locales/fr/common.json';

const LANGUAGE = { EN: 'en', FR: 'fr' } as const;

const resources = {
	[LANGUAGE.EN]: { common: enCommon },
	[LANGUAGE.FR]: { common: frCommon },
} as const;

let initialized = false;

/**
 * Initializes the i18next instance used by the app, wiring language detection and React bindings.
 *
 * This function is safe to call multiple times; initialization runs only once.
 *
 * @returns The configured i18next instance.
 */
export async function setupI18n() {
	if (!initialized) {
		initialized = true;

		await i18n
			.use(LanguageDetector)
			.use(initReactI18next)
			.init({
				resources,
				fallbackLng: LANGUAGE.EN,
				defaultNS: 'common',
				interpolation: {
					escapeValue: false,
				},
				detection: {
					order: ['localStorage', 'navigator', 'htmlTag'],
				},
				supportedLngs: [LANGUAGE.EN, LANGUAGE.FR],
			});
	}

	return i18n;
}

export type AppLanguage = keyof typeof resources;
export type AppNamespace = keyof (typeof resources)['en'];
export type AppNamespaceKeys<Namespace extends AppNamespace> = Namespace extends keyof (typeof resources)['en']
	? keyof (typeof resources)['en'][Namespace]
	: never;
