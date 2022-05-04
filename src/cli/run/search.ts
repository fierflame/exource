import { cosmiconfig, defaultLoaders } from 'cosmiconfig'
export default async function() {
	const explorer = cosmiconfig('exource', {
		searchPlaces: [
			`exource.config.js`,
			`exource.config.mjs`,
			`exource.config.yml`,
			`exource.config.yaml`,
			`exource.config.json`,
			`config/exource.js`,
			`config/exource.mjs`,
			`config/exource.yml`,
			`config/exource.yaml`,
			`config/exource.json`,
			'package.json',
		],loaders: {
			...defaultLoaders,
			'.mjs': p => import(p),
		}
	});
	return await explorer.search();
	
	
}
