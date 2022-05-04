import * as chokidar from 'chokidar';
import type { ScanCallback, ScanOptions } from '../types';



export default function (
	cwd: string,
	path: string | string[],
	{changed}: ScanOptions,
	cb: ScanCallback,
) {
	const modules = new Set<string>();
	function update(path: string, unlink?: boolean) {
		const p = path
		if (unlink) { modules.delete(p) } else { modules.add(p) }
		cb([...modules], p, unlink)
	}
	const watcher = chokidar.watch(path, { cwd });
	watcher.on('add', p => { update(p, false); });
	watcher.on('unlink', p => { update(p, true); });
	if (changed) {
		watcher.on('change', p => { update(p); });
	}
	let stopped = false;
	return () => {
		if (stopped) { return; }
		watcher.close();
	}

}
