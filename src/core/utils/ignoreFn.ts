
/** 确保不会同时执行多次，如果当前存在执行中的 Promise，则不会再被执行，除非是在完成前最后传入的参数 */
export default function ignoreFn<T, P extends any[], R>(
	f: (this: T, ...argv: P) => R | Promise<R>,
): (this: T, ...argv: P) => Promise<R> {
	type PromiseBackCall = [(value: R | PromiseLike<R>) => void, (reason?: any) => void];
	type Param = [T, ...P];
	let running = false;
	let nextParams: Param | undefined;
	let end: PromiseBackCall[] = [];
	async function exec(): Promise<void> {
		if (running) { return; }
		running = true;
		while(nextParams) {
			const params = nextParams
			nextParams = undefined;

			const callbacks = end;
			end = [];

			//执行函数
			let ret: R, error = false;
			try {
				ret = await f.call(...params);
			} catch (e) {
				ret = e as any;
				error = true;
			}
			//返回函数
			for (let f of callbacks) {
				f[error ? 1 : 0](ret);
			}
		};
		running = false;
	}
	return async function (this: T, ...p: P) {
		return new Promise((f1, f2) => {
			end.push([f1, f2]);
			nextParams = [this, ...p];
			exec();
		});
	};
}
