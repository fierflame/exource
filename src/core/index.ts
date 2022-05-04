import ignoreFn from './utils/ignoreFn';
export * from './utils';
import * as pathFn from 'node:path/posix'
import type { Plugin, Options } from './types';
import type { Context } from './Context';
import createApi from './createApi';
import writeIndex from './writeIndex';
export {default as logger} from './logger';
import * as fsPromises from 'node:fs/promises';
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
} from './types';

function initDataChannel() {
	const data: Record<string | symbol, any> = Object.create(null);
	const listeners: Record<string | symbol, Set<(data: any) => any>> = Object.create(null);

	function emit(name: string | symbol, value: any) {
		data[name] = value;
		const set = listeners[name];
		if (!set) { return; }
		for (const l of set) {
			l(value);
		}
	}
	function get(name: string) {
		return data[name];
	}
	function listen(pluginId: string, name: string, get: true, listener: (data: any) => any): () => void
	function listen(pluginId: string, name: string, listener: (data: any) => any): () => void
	function listen(
		pluginId: string,
		name: string,
		get: ((data: any) => any) | true,
		listener?: (data: any) => any
	): () => void {
		const f = [get, listener].find(t => typeof t === 'function') as ((data: any) => any | undefined);
		if (!f) { return () => {}; }
		function fn(v: any) { f(v) }
		let set = listeners[name];
		if (!set) {set = new Set(); listeners[name] = set; }
		set.add(fn);
		if (get === true) { fn(data[name]) }
		return () => { set.delete(fn); }
	}
	return {emit, get, listen};
}

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
			const f = pathFn.resolve(cwd, outputRoot, from);
			const t = pathFn.resolve(cwd, o ? '' : outputRoot, to);
			return pathFn.relative(f, t);
		},
		imports, plugins, awaitPlugins,
		updateIndex: ignoreFn(() => writeIndex(outputRoot, imports)),
	}
	try {
		await fsPromises.rm(outputRoot, {recursive: true});
	} catch {
	}
	return createApi(context, 'exource');
};
