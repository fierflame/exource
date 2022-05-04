import glob from 'fast-glob';
import readCfg from '../readCfg';

async function readAllCfg(
	cwd: string,
	plugin: string,
	paths: string[],
) {
	const modules: Record<string, any> = {};
	for (const path of paths) {
		const cfg = await readCfg(cwd, plugin, path);
		if (!cfg) { continue; }
		modules[path] = cfg;
	}
	return modules;

}


export default async function(cwd: string, plugin: string, path: string | string[]) {
	try {
		const list = await glob(path, {cwd})
		return await readAllCfg(cwd, plugin, list)
	} catch(e) {
		// TODO
		return {}
	}
};
