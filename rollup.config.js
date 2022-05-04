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
	'node:fs/promises', 'node:path/posix', 'node:path',
	...Object.keys(dependencies),
];
const extensions = ['.ts'];

fsFn.rmSync('public', { recursive: true })
fsFn.mkdirSync(`public`, {recursive: true})
fsFn.writeFileSync(`public/package.json`, JSON.stringify({
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
	fsFn.mkdirSync(`public/${name}`, {recursive: true})
	fsFn.writeFileSync(`public/${name}/package.json`, subPackage)
	return [{
		input,
		output: { file: `public/${name}/index.mjs`, format: 'esm', banner },
		external,
		plugins: createPlugins(),
	}, {
		input,
		output: { file: `public/${name}/index.d.ts`, format: 'esm', banner },
		external,
		plugins: [ dts() ],
	}]
}
const GlobalName = name.replace(/(?:^|-)([a-z])/g, (_, s) => s.toUpperCase());
export default [
	{
		input: 'src/core/index.ts',
		output: { file: `public/index.mjs`, format: 'esm', banner },
		external,
		plugins: createPlugins(),
	}, {
		input: 'src/core/index.ts',
		output: { file: 'public/index.d.ts', format: 'esm', banner },
		external,
		plugins: [ dts() ],
	}, {
		input: 'src/cli/index.ts',
		output: { file: `public/cli.mjs`, format: 'esm', banner: `#!/usr/bin/env node\n${banner}` },
		external,
		plugins: createPlugins(),
	},
	...create('register'),
	...create('routes-config'),
	...create('vue-router'),
	...create('vue-i18n'),
];
