import * as chokidar from 'chokidar';
import type { ScanCallbackEvery, ScanOptions } from '../../types';



export default function (
	cwd: string,
	path: string | string[],
	{changed}: ScanOptions,
	cb: ScanCallbackEvery,
) {
	const modules = new Set<string>();
	function update(path: string, unlink: boolean) {
		const p = path
		if (unlink) { modules.delete(p) } else { modules.add(p) }
		cb(p, unlink, [...modules]);
	}
	const watcher = chokidar.watch(path, { cwd });
	watcher.on('add', p => { update(p, false); });
	watcher.on('unlink', p => { update(p, true); });
	if (changed) {
		watcher.on('change', p => { update(p, false); });
	}
	let stopped = false;
	return () => {
		if (stopped) { return; }
		watcher.close();
	}

}
