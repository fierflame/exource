import type { Api } from '../types';
import write from '../write';
import logger from '../logger';

import scan from './scan';
import readCfg from './readCfg';
import type { Context } from './Context';
import pluginApi from './pluginApi';
import remove from './remove';
import read from './read';
import scanCfg from './scanCfg';

export type { Context } from './Context';

function trans(path?: string | string[] | Record<string, boolean | string>) {
	const paths: Record<string, boolean | string> = {};
	if (!path) { return paths; }
	if (Array.isArray(path)) {
		for (const p of path) {
			if (!p) { continue; }
			if (typeof p !== 'string') { continue; }
			paths[p] = false;
		}
		return paths;
	}
	for (const [p,v] of Object.entries(path)) {
		if (!p) { continue; }
		paths[p] = v && typeof v === 'string' || v === true ? v : false;
	}
	return paths;
	
}
const version = '__VERSION__';
export default function createApi(
	context: Context,
	pluginId: string = '',
	tag: string = '',
): Api {
	const pluginTag = tag || pluginId;
	const s = pluginTag || Symbol();
	const {
		imports,
		updateIndex,
		cwd,
		watch,
		root,
		outputRoot,
		moduleDir,
		get, emit, listen,
		relativePath,
		getVersion,
	} = context;

	return {
		cwd,
		watch,
		root,
		moduleDir,
		relativePath,
		getVersion,
		version,

		setImport(path?: string | string[] | Record<string, boolean | string>) {
			imports[s] = trans(path)
			updateIndex();
		},
		get, listen, emit: emit.bind(null, s) as Api['emit'],
		readCfg: readCfg.bind(null, cwd, pluginTag),
		read: read.bind(null, cwd, pluginTag) as Api['read'],
		write: write.bind(null, outputRoot, pluginTag),
		remove: remove.bind(null, outputRoot, pluginTag),
		scan: scan.bind(null, watch, cwd) as Api['scan'],
		scanCfg: scanCfg.bind(null, watch, cwd, pluginTag) as Api['scanCfg'],
		plugin: pluginApi.bind(null, context) as Api['plugin'],
		logger: {
			info: logger.bind(null, 0, pluginTag, ''),
			warn: logger.bind(null, 1, pluginTag, ''),
			error: logger.bind(null, 2, pluginTag, ''),
			tag(t: string) {
				return {
					info: logger.bind(null, 0, pluginTag, t),
					warn: logger.bind(null, 1, pluginTag, t),
					error: logger.bind(null, 2, pluginTag, t),
				}
			}
		}
	}
}
