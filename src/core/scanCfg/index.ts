import type { ScanCfgCallback } from '../types';
import get from './get';
import mainScan from './mainScan';

function toCfgPath(path: string) {
	return `${path}.{yml,yaml,json,json5}`;
}
function scanCfg(
	watch: boolean,
	cwd: string,
	plugin: string,
	path: string | string[],
	cb: ScanCfgCallback
): () => void;
function scanCfg(
	watch: boolean,
	cwd: string,
	plugin: string,
	path: string | string[],
): Promise<Record<string, any>>;
function scanCfg(
	watch: boolean,
	cwd: string,
	plugin: string,
	path: string | string[],
	cb?: ScanCfgCallback
) {
	const paths = Array.isArray(path) ? path.map(toCfgPath) : [toCfgPath(path)]
	if (cb && watch) { return mainScan(cwd, plugin, paths, cb) }
	const promise = get(cwd, plugin, paths)
	if (!cb) { return promise; }
	promise.then(modules => {
		for (const [path, cfg] of Object.entries(modules)) {
			cb({...modules}, path, cfg, true);
		}
	});
	return () => {};
};



export default scanCfg
