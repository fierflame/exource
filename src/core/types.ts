
export interface Logger {
	info(text: string): void;
	warn(text: string): void;
	error(text: string): void;
}
export interface ApiLogger extends Logger {
	tag(t: string): Logger
}
export interface Api {
	version: string;
	cwd: string;
	root: string;
	watch: boolean;
	moduleDir: string;
	write(path: string, v: string): Promise<boolean>;
	remove(path: string): Promise<boolean>;
	read(path: string, encoding?: null): Promise<Buffer | null>;
	read(path: string, encoding: BufferEncoding): Promise<string | null>;
	read(path: string, encoding?:null | BufferEncoding): Promise<string | Buffer | null>;
	readCfg(path: string): Promise<Record<string, any>>;
	setImport(path?: string | string[] | Record<string, false | string>): void;

	scan(
		path: string | string[],
		opt: ScanOptions,
		cbEvery: ScanCallbackEvery,
		cbAll?: ScanCallbackAll,
	): () => void;
	scan(
		path: string | string[],
		cbEvery: ScanCallbackEvery,
		cbAll?: ScanCallbackAll,
	): () => void;
	scan(path: string | string[]): Promise<string[]>;

	scanCfg(
		path: string | string[], 
		opt: ScanCfgOptions, 
		cbEvery: ScanCfgCallbackEvery,
		cbAll?: ScanCfgCallbackAll,
	): () => void;
	scanCfg(
		path: string | string[], 
		cbEvery: ScanCfgCallbackEvery,
		cbAll?: ScanCfgCallbackAll,
	): () => void;
	scanCfg(
		path: string | string[], 
		opt?: ScanCfgOptions,
	): Promise<Record<string, any>>;

	logger: ApiLogger;

	plugin(id: string, wait: true): Promise<void>;
	plugin(id: string, wait?: false): boolean;
	plugin<T extends Record<string, any>>(plugin: Plugin<T>, cfg?: Partial<T>): Promise<boolean>;

	getVersion(pkg: string): Promise<string>;

	relativePath(from: string, to: string, toCwd?: boolean): string;

	emit<T>(name: string | symbol, value?: T): void
	get<T>(name: string): T[];
	listen<T>(name: string, listener: (...data: T[]) => any): () => void
	listen<T>(name: string, get: true, listener: (...data: T[]) => any): () => void


}

export interface ScanOptions {
	changed?: boolean;
}
export interface ScanCallbackEvery {
	(path: string, unlink: boolean, paths: string[]): any;
}
export interface ScanCallbackAll {
	(paths: string[]): any;
}
export interface ScanCfgOptions {
	handle?(v: any, path: string): any
}
export interface ScanCfgCallbackEvery {
	(path: string, cfg: any, paths: Record<string, any>): any;
}
export interface ScanCfgCallbackAll {
	(paths: Record<string, any>): any;
}
export interface Plugin<T extends Record<string, any> = Record<string, any>> {
	(api: Api, cfg: Partial<T>): void | PromiseLike<void>;
	id?: string;
	tag?: string;
}
export interface Options {
	cwd?: string;
	root?: string;
	watch?: boolean;
	moduleDir?: string;
	output?: string;
}
interface NamedPlugin {
	'exource/locales': typeof import('exource/locales').default;
	'exource/register': typeof import('exource/register').default;
	'exource/routes-config': typeof import('exource/routes-config').default;
	'exource/routes-config-handler-authority': typeof import('exource/routes-config-handler-authority').default;
	'exource/routes-config-handler-navigator': typeof import('exource/routes-config-handler-navigator').default;
	'exource/vue-i18n': typeof import('exource/vue-i18n').default;
	'exource/vue-router': typeof import('exource/vue-router').default;
	'exource/vue-routes': typeof import('exource/vue-routes').default;
}
export type NamedPluginItem = {
	[K in keyof NamedPlugin]: [K, (NamedPlugin[K] extends Plugin<infer T> ? T : Record<string, any>)?]
}[keyof NamedPlugin];

export type PluginItem<T extends Plugin<any> = Plugin<any>> = 
	[T, (T extends Plugin<infer P> ? P : Record<string, any>)?]
export interface Config {
	cwd?: string;
	root?: string;
	moduleDir?: string;
	/** @default `${root}/` */
	output?: string;
	plugins?: (
		| NamedPluginItem
		| PluginItem
		| [string | Plugin<any>, Record<string, any>?]
		| string
		| Plugin<any>
	)[];
}
