import type { Plugin } from '../types';
import type { Context } from './Context';
import createApi from '.';


function pluginApi(context: Context, id: string, wait?: false): boolean;
function pluginApi(context: Context, plugin: Plugin, cfg?: Record<string, any>): Promise<boolean>;
function pluginApi(context: Context, id: string, wait: true): Promise<void>;
function pluginApi(
	context: Context,
	plugin: string | Plugin,
	cfg?: any,
): boolean | Promise<boolean> | Promise<void> {
	if (typeof plugin === 'function') { return runPlugin(context, plugin, cfg); }
	if (typeof plugin !== 'string') { return false; }
	const { plugins, awaitPlugins } = context;
	if (!cfg) { return plugins.has(plugin); }
	return new Promise<void>(r => {
		if (plugins.has(plugin)) { return r(); }
		let s = awaitPlugins.get(plugin);
		if (!s) {
			s = new Set()
			awaitPlugins.set(plugin, s);
		}
		s.add(r);
	});
}

async function runPlugin<T extends Record<string, any> = Record<string, any>>(
	context: Context,
	plugin: Plugin<T>,
	cfg?: Partial<T>
) {
	const id = plugin.id
	if (!id || typeof id !== 'string') {
		await plugin(createApi(context, id), typeof cfg === 'object' && cfg || {});
		return true;
	}
	const { plugins } = context
	if (plugins.has(id)) { return false; }
	plugins.set(id, plugin);
	await plugin(createApi(context, id, plugin.tag), typeof cfg === 'object' && cfg || {});
	const { awaitPlugins } = context
	const set = awaitPlugins.get(id) || [];
	awaitPlugins.delete(id)
	for (const s of set) { s() }
	return true;
}
export default pluginApi;
