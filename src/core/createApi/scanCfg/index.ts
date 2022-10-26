import type { ScanCfgCallbackAll, ScanCfgCallbackEvery, ScanCfgOptions } from '../../types';
import get from './get';
import mainScan from './mainScan';

function getArgs(
	opt?: ScanCfgOptions | ScanCfgCallbackEvery,
	cb?: ScanCfgCallbackEvery | ScanCfgCallbackAll,
	cb2?: ScanCfgCallbackAll,
): [ScanCfgOptions, ScanCfgCallbackEvery?, ScanCfgCallbackAll?] {
	if (typeof opt === 'function') {
		return [{}, opt, typeof cb === 'function' ? cb as ScanCfgCallbackAll : undefined]
	}
	if (typeof cb === 'function') {
		if (typeof cb2 === 'function') {
			return [opt || {}, cb as ScanCfgCallbackEvery, cb2 as ScanCfgCallbackAll]
		}
		return [opt || {}, cb as ScanCfgCallbackEvery, typeof cb2 === 'function' ? cb2 as ScanCfgCallbackAll : undefined]
	}
	return [opt || {}];
}

function toCfgPath(path: string) {
	return `${path}.{yml,yaml,json,json5}`;
}
function scanCfg(
	watch: boolean,
	cwd: string,
	plugin: string,
	path: string | string[],
	opt: ScanCfgOptions,
	cb: ScanCfgCallbackEvery,
	cbAll?: ScanCfgCallbackAll,
): () => void;
function scanCfg(
	watch: boolean,
	cwd: string,
	plugin: string,
	path: string | string[],
	cb: ScanCfgCallbackEvery,
	cbAll?: ScanCfgCallbackAll,
): () => void;
function scanCfg(
	watch: boolean,
	cwd: string,
	plugin: string,
	path: string | string[],
	opt?: ScanCfgOptions,
): Promise<Record<string, any>>;
function scanCfg(
	watch: boolean,
	cwd: string,
	plugin: string,
	path: string | string[],
	opt?: ScanCfgOptions | ScanCfgCallbackEvery,
	cb1?: ScanCfgCallbackEvery | ScanCfgCallbackAll,
	cb2?: ScanCfgCallbackAll,
) {
	const [opts, cbEvery, cbAll] = getArgs(opt, cb1, cb2);
	const paths = Array.isArray(path) ? path.map(toCfgPath) : [toCfgPath(path)]
	if (cbEvery && watch) { return mainScan(cwd, plugin, paths, opts, cbEvery) }
	const promise = get(cwd, plugin, paths, opts)
	if (!cbEvery) { return promise; }
	if (cbAll) {
		promise.then(modules => { cbAll({...modules}); });
	} else {
		promise.then(modules => {
			for (const [path, cfg] of Object.entries(modules)) {
				cbEvery(path, cfg, {...modules});
			}
		});
	}
	return () => {};
};



export default scanCfg
