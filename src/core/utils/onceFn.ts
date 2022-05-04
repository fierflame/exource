export default function onceFn<T,P extends any[], R>(f: (this: T, ...p: P) => R): (this: T, ...p: P) => R {
	let run = false;
	let ret: any;
	return function fn(this: T, ...p: P) {
		if (run) { return; }
		run = true;
		try {
			ret = f.apply(this, p);
			return ret;
		} catch(e) {
			run = false;
			throw e;
		}
	}
}
