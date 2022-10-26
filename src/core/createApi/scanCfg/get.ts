import glob from 'fast-glob';
import readCfg from '../readCfg';
import { ScanCfgOptions } from '../../types';

async function readAllCfg(
	cwd: string,
	plugin: string,
	paths: string[],
	{handle}: ScanCfgOptions,
) {
	const modules: Record<string, any> = {};
	for (const path of paths) {
		let cfg = await readCfg(cwd, plugin, path);
		if (!cfg) { continue; }
		try {
			if (cfg && typeof handle === 'function') {
				cfg = await handle(cfg, path);
			}
		} catch {
			continue;
		}
		if (!cfg) { continue; }
		modules[path] = cfg;
	}
	return modules;

}


export default async function(
	cwd: string,
	plugin: string,
	path: string | string[],
	opt: ScanCfgOptions,
) {
	try {
		const list = await glob(path, {cwd})
		return await readAllCfg(cwd, plugin, list, opt)
	} catch(e) {
		// TODO
		return {}
	}
};
