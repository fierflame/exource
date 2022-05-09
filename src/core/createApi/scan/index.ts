import type { ScanCallback, ScanOptions } from '../../types';
import get from './get';
import mainScan from './mainScan';

function scan(
	watch: boolean,
	cwd: string,
	path: string | string[],
	opt: ScanOptions,
	cb: ScanCallback
): () => void;
function scan(
	watch: boolean,
	cwd: string,
	path: string | string[],
	cb: ScanCallback
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
	opt?: ScanOptions | ScanCallback,
	callback?: ScanCallback
) {
	const cb = [opt, callback].find(v => typeof v === 'function') as ScanCallback | undefined
	if (cb && watch) { return mainScan(cwd, path, typeof opt === 'object' ? opt : {}, cb); }
	if (!cb) { return get(cwd, path); }
	const promise = get(cwd, path);
	if (!cb) { return promise; }
	promise.then(paths => {
		for (const path of paths) {
			cb([...paths], path, false, true);
		}
	});
	return () => {};
};

export default scan
