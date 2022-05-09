
import type { Plugin } from './types';

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
	emit(name: string | symbol, value: any): void
	get(name: string): any;
	listen(pluginId: string, name: string, get: true, listener: (data: any) => any): () => void
	listen(pluginId: string, name: string, listener: (data: any) => any): () => void
	relativePath(from: string, to: string, fromOutput?: boolean): string;
	getVersion(pkg: string): Promise<string>;
}
