import { cosmiconfig, defaultLoaders } from 'cosmiconfig'
import * as fsPromise from 'node:fs/promises';
import * as JSON5 from 'json5';
export default async function() {
	const explorer = cosmiconfig('exource', {
		searchPlaces: [
			`.exourcerc.js`,
			`.exourcerc.mjs`,
			`.exourcerc.yml`,
			`.exourcerc.yaml`,
			`.exourcerc.json`,
			`.exourcerc.json5`,
			`exource.config.js`,
			`exource.config.mjs`,
			`exource.config.yml`,
			`exource.config.yaml`,
			`exource.config.json`,
			`exource.config.json5`,
			`config/exource.js`,
			`config/exource.mjs`,
			`config/exource.yml`,
			`config/exource.yaml`,
			`config/exource.json`,
			`config/exource.json5`,
			'package.json',
		],loaders: {
			...defaultLoaders,
			'.js': (p, c) => Promise.resolve(defaultLoaders['.js'](p, c)).then(v => 'default' in v && v.default || v),
			'.mjs': p => import(p).then(v => v.default).then(v => 'default' in v && v.default || v),
			'.json5': p => fsPromise.readFile(p, 'utf-8').then(v => JSON5.parse(v)),
		}
	});
	return await explorer.search();
	
	
}
