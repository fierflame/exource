import * as chokidar from 'chokidar';
import type { ScanCfgCallback, ScanCfgOptions } from '../../types';
import { ignoreMapFn } from '../../utils';
import readCfg from '../readCfg';

export default function mainScan(
	cwd: string,
	plugin: string,
	path: string | string[],
	{handle}: ScanCfgOptions,
	cb: ScanCfgCallback,
) {
	const modules: Record<string, any> = {};
	const update = ignoreMapFn(async (path: string, unlink?: boolean) => {
		let cfg = unlink ? null : await readCfg(cwd, plugin, path);
		try {
			if (cfg && typeof handle === 'function') {
				cfg = await handle(cfg, path);
			}
		} catch {
			cfg = null;
		}
		if (cfg) {
			modules[path] = cfg;
			cb({...modules}, path, cfg)
		} else if (path in modules) {
			delete modules[path];
			cb({...modules}, path, null);
		}
	})
	const watcher = chokidar.watch(path, { cwd });
	watcher.on('add', p => { update(p); });
	watcher.on('unlink', p => { update(p, true); });
	watcher.on('change', p => { update(p); });
	let stopped = false;
	return () => {
		if (stopped) { return; }
		watcher.close();
	}

}
