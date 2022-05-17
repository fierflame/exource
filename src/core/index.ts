import ignoreFn from './utils/ignoreFn';
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
	Api,
	Logger,
	ApiLogger,
	ScanCallback,
	ScanOptions,
	Plugin,
	Options,
	Config,
	ScanCfgCallback,
	ScanCfgOptions,
} from './types';


export default async function exource({
	cwd = process.cwd(),
	root = 'src',
	moduleDir = 'modules',
	watch = false,
	output = `${root}/_exource`
}: Options = {}) {
	const imports: Record<string | symbol, Record<string, boolean | string>> = {};
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
		imports, plugins, awaitPlugins,
		updateIndex: ignoreFn(() => writeIndex(outputRoot, imports)),
	}
	try {
		await fsPromises.rm(outputRoot, {recursive: true});
	} catch {
	}
	return createApi(context, 'exource');
};
exource.version = '__VERSION__';
