import exource, { logger } from 'exource'
import type { Plugin } from 'exource'
import resolve from 'resolve'
import pathFn from 'node:path/posix'
async function findPlugin(
	cwd: string,
	fileDir: string,
	plugin: string,
): Promise<Plugin | null> {
	if (!plugin) { return null; }
	const path = await new Promise<string>((r) => {
			resolve(plugin, {
				basedir: plugin[0] === '.' ? fileDir : cwd
			}, (err, res) => r(err ? '' : res || ''));
	});
	if (!path) {
		logger(2, 'exource', 'start', `找不到插件 \`${plugin}\``);
		return null;
	}
	try {
		const module = await import(path);
		const plugin = module.default;
		if (typeof plugin === 'function') { return plugin}
	} catch{
		logger(2, 'exource', 'start', `插件 \`${plugin}\` 加载失败`);
	}
	return null;

}
async function parsePlugin(
	cwd: string,
	fileDir: string,
	pluginInfo: string | Plugin | [string | Plugin, any?],
): Promise<[Plugin, any?] | null> {
	if (typeof pluginInfo === 'function') {
		return [pluginInfo];
	}
	if (typeof pluginInfo === 'string') {
		const plugin = await findPlugin(cwd, fileDir, pluginInfo);
		return plugin ? [plugin] : null
	}
	if (Array.isArray(pluginInfo)) {
		const [p, cfg] = pluginInfo;
		if (typeof p === 'function') {
			return [p, cfg];
		}
		if (typeof p === 'string') {
			const plugin = await findPlugin(cwd, fileDir, p);
			return plugin ? [plugin, cfg] : null
		}
	}
	return null;
}

async function parsePlugins(
	cwd: string,
	filepath: string,
	plugins?: (string | Plugin | [string | Plugin, any?]) | Record<string, any>
): Promise<[Plugin, any?][]> {
	if (!plugins) { return [] }
	
	const fileDir = filepath.replace(/[\/\\]([^\\\/]+)$/g,'');
	if (Array.isArray(plugins)) {
		const list = await Promise.all(plugins.map(p => parsePlugin(cwd, fileDir, p)))
		return list.filter(Boolean) as [Plugin, any?][]
	}
	if (typeof plugins !== 'object') { return []; }
	const list: [Plugin, any?][] = [];
	for (const [p, cfg] of Object.entries(plugins)) {
		const plugin = await findPlugin(cwd, fileDir, p);
		if (plugin) { list.push([plugin, cfg]) }
	}
	return list;
}
export default async function start(
	filepath: string,
	config: any,
	watch: boolean,
) {
	const cfg = 'default' in config ? config.default : config;
	const cwd = cfg?.cwd
		? pathFn.resolve(filepath, '..', cfg.cwd)
		: filepath.replace(/[\/\\](exource\.config|config[\/\\]exource)\.(m?js|ya?ml|json5?)$/g,'');
	const api = await exource({
		cwd,
		root: cfg.root,
		moduleDir: cfg.moduleDir,
		output: cfg.output,
		watch,
	})
	for (const [p, c] of await parsePlugins(cwd, filepath, cfg.plugins)) {
		api.plugin(p, c);
	}
}
