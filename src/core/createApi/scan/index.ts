import type { ScanCallbackAll, ScanCallbackEvery, ScanOptions } from '../../types';
import get from './get';
import mainScan from './mainScan';

function getArgs(
	opt?: ScanOptions | ScanCallbackEvery,
	cb?: ScanCallbackEvery | ScanCallbackAll,
	cb2?: ScanCallbackAll,
): [ScanOptions, ScanCallbackEvery?, ScanCallbackAll?] {
	if (typeof opt === 'function') {
		return [{}, opt, typeof cb === 'function' ? cb as ScanCallbackAll : undefined]
	}
	if (typeof cb === 'function') {
		if (typeof cb2 === 'function') {
			return [opt || {}, cb as ScanCallbackEvery, cb2 as ScanCallbackAll]
		}
		return [opt || {}, cb as ScanCallbackEvery, typeof cb2 === 'function' ? cb2 as ScanCallbackAll : undefined]
	}
	return [opt || {}];
}
function scan(
	watch: boolean,
	cwd: string,
	path: string | string[],
	opt: ScanOptions,
	cb: ScanCallbackEvery,
	cbAll?: ScanCallbackAll,
): () => void;
function scan(
	watch: boolean,
	cwd: string,
	path: string | string[],
	cb: ScanCallbackEvery,
	cbAll?: ScanCallbackAll,
): () => void;
function scan(
	watch: boolean,
	cwd: string,
	path: string | string[],
): Promise<string[]>;
function scan(
	watch: boolean,
	cwd: string,
	path: string | string[],
	opt?: ScanOptions | ScanCallbackEvery,
	cb1?: ScanCallbackEvery | ScanCallbackAll,
	cb2?: ScanCallbackAll,
) {
	const [opts, cbEvery, cbAll] = getArgs(opt, cb1, cb2);
	if (cbEvery && watch) { return mainScan(cwd, path, opts, cbEvery); }
	const promise = get(cwd, path);
	if (!cbEvery) { return promise; }
	if (cbAll) {
		promise.then(paths => { cbAll([...paths]); });
	} else {
		promise.then(paths => {
			for (const path of paths) {
				cbEvery(path, false, [...paths]);
			}
		});
	}
	return () => {};
};

export default scan
