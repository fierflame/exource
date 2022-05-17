
import type { Plugin } from '../types';

export interface Context {
	cwd: string;
	watch: boolean;
	root: string;
	moduleDir: string;
	outputRoot: string;
	imports: Record<string | symbol, Record<string, string | boolean>>;
	awaitPlugins: Map<string, Set<() => void>>;
	plugins: Map<string, Plugin<any>>;
	updateIndex(): any;
	emit(pluginId: string | symbol, name: string | symbol, value: any): void
	get(name: string | symbol): any[];
	listen(name: string | symbol, get: true, listener: (...data: any[]) => any): () => void
	listen(name: string | symbol, listener: (...data: any[]) => any): () => void
	relativePath(from: string, to: string, fromOutput?: boolean): string;
	getVersion(pkg: string): Promise<string>;
}
