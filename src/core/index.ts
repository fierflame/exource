export * from './utils';
import * as pathFn from 'node:path/posix'
import type { Plugin, Options } from './types';
import type { Context } from './createApi';
import createApi from './createApi';
import writeIndex from './writeIndex';
export {default as logger} from './logger';
import * as fsPromises from 'node:fs/promises';
import getVersion from './getVersion';
import initDataChannel from './initDataChannel';
export type {
	Api, Logger, ApiLogger,
	ScanCallback, ScanOptions,
	ScanCfgCallback, ScanCfgOptions,
	Plugin, Options,
	NamedPluginItem, PluginItem, Config,
} from './types';


export default async function exource({
	cwd = process.cwd(),
	root = 'src',
	moduleDir = 'modules',
	watch = false,
	output = `${root}/_exource`
}: Options = {}) {
	const plugins = new Map<string, Plugin>([['exource', () =>{}]]);
	const awaitPlugins = new Map<string, Set<() => void>>();
	const outputRoot = pathFn.resolve(cwd, output);
	const {emit, listen, get} = initDataChannel();
	const context: Context = {
		cwd,
		watch,
		root,
		moduleDir,
		outputRoot,
		emit, listen, get,
		relativePath(from, to, o) {
			const f = pathFn.join('/', output, from);
			const t = pathFn.join('/', o ? '' : output, to);
			const path = pathFn.relative(f, t);
			if (!path) { return '.'; }
			if ('./'.includes(path[0])) { return path }
			return`./${path}`;
		},
		getVersion: getVersion.bind(null, cwd),
		plugins, awaitPlugins,
	}
	listen<string | string[] | Record<string, boolean | string>>('import', true, (...paths) => {
		writeIndex(outputRoot, paths)
	})
	try {
		await fsPromises.rm(outputRoot, {recursive: true});
	} catch {
	}
	return createApi(context, 'exource');
};
exource.version = '__VERSION__';
