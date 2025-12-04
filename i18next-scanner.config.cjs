// i18next-scanner configuration
// This will scan TS/TSX files for i18n keys and default values, and generate one JSON file per language.
/** @type {import('i18next-scanner').ScannerOptions} */
module.exports = {
	input: ['src/**/*.{ts,tsx}'],
	output: './public/locales',
	options: {
		removeUnusedKeys: false, // In caese of dynamic keys
		sort: true,
		func: {
			list: ['t', 'i18next.t', 'i18n.t'],
			extensions: ['.ts', '.tsx'],
		},
		trans: {
			component: 'Trans',
			i18nKey: 'i18nKey',
			extensions: ['.tsx'],
		},
		lngs: ['en', 'fr'],
		defaultLng: 'en',
		defaultNs: 'common',
		ns: ['common'],
		// Use the key itself as the default English value.
		// You can customize this if you prefer another strategy.
		defaultValue: (lng, _ns, key) => (lng === 'en' ? key : ''),
		resource: {
			loadPath: 'public/locales/{{lng}}/{{ns}}.json',
			savePath: '{{lng}}/{{ns}}.json',
			jsonIndent: 2,
		},
		keySeparator: '.',
		nsSeparator: ':',
	},
};
