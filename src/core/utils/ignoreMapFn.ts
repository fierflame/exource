import ignoreFn from './ignoreFn';

export default function ignoreMapFn<T, P extends any[], R>(
	f: (this: T, path: string, ...p: P)=> Promise<R> | R
): (this: T, path: string, ...p: P)=> Promise<R> {
	const fns = new Map<string, (path: string, ...p: P) => Promise<R>>();
	return async function add(path: string, ...p: P) {
		let fn = fns.get(path);
		if (!fn) { fns.set(path, fn = ignoreFn(f)); }
		return fn(path, ...p);
	}
	
}
