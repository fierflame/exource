import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import dts from 'rollup-plugin-dts';
import replace from 'rollup-plugin-replace';
import fsFn from 'fs';
import info from './package.json';
const {
	name, description, version, engines, dependencies,
	author, license, homepage, repository, bugs,
} = info;

const plugins = [
	'locales',
	'register',
	'routes-config',
	'routes-config-handler-authority',
	'routes-config-handler-navigator',
	'vue-router',
	'vue-i18n',
];

const beginYear = 2022;
const year = new Date().getFullYear();

const banner = `\
/*!
 * ${ name } v${ version }
 * (c) ${ beginYear === year ? beginYear : `${ beginYear }-${ year }` } ${ author }
 * @license ${ license }
 */
`;

const external = [
	name,
	...plugins.map(p => `${name}/${p}}`),
	'node:fs/promises', 'node:path/posix', 'node:path',
	...Object.keys(dependencies),
];
const extensions = ['.ts'];

fsFn.writeFileSync(`build/package.json`, JSON.stringify({
	name, description, version, engines, dependencies,
	type: 'module', main: 'index.mjs', bin: 'cli.mjs',
	author, license, homepage, repository, bugs,
}, null, 2))


const subPackage = JSON.stringify({main: 'index.mjs', type: 'module'}, null, 2);
function createPlugins() {
	return [
		resolve({ extensions }),
		babel({ extensions, plugins: ['@babel/plugin-transform-typescript'] }),
		replace({ __VERSION__: version }),
	]
}
function create(name) {
	const input = `src/plugins/${name}/index.ts`
	fsFn.mkdirSync(`build/${name}`, {recursive: true})
	fsFn.writeFileSync(`build/${name}/package.json`, subPackage)
	return [{
		input,
		output: { file: `build/${name}/index.mjs`, format: 'esm', banner },
		external,
		plugins: createPlugins(),
	}, {
		input,
		output: { file: `build/${name}/index.d.ts`, format: 'esm', banner },
		external,
		plugins: [ dts() ],
	}]
}
export default [
	{
		input: 'src/core/index.ts',
		output: { file: `build/index.mjs`, format: 'esm', banner },
		external,
		plugins: createPlugins(),
	}, {
		input: 'src/core/index.ts',
		output: { file: 'build/index.d.ts', format: 'esm', banner },
		external,
		plugins: [ dts() ],
	}, {
		input: 'src/cli/index.ts',
		output: { file: `build/cli.mjs`, format: 'esm', banner: `#!/usr/bin/env node\n${banner}` },
		external,
		plugins: createPlugins(),
	},
	...plugins.map(v => create(v)).flat(),
];
