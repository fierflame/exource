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
	const path = await new Promise<string>((r) => resolve(plugin, {
		basedir: plugin[0] === '.' ? fileDir : cwd
	}, (err, res) => r(err ? '' : res || '')));
	if (!path) {
		logger(2, 'exource', 'start', `找不到插件 \`${plugin}\``);
		return null;
	}
	try {
		const module = await import(path);
		const plugin = module.default;
		if (typeof plugin === 'function') { return plugin; }
	} catch{}
	logger(2, 'exource', 'start', `从 \`${path}\` 加载插件 \`${plugin}\` 失败`);
	return null;

}
async function parsePlugin(
	cwd: string,
	fileDir: string,
	pluginInfo: string | Plugin | [string | Plugin, any?],
): Promise<[Plugin, any?] | null> {
	if (typeof pluginInfo === 'function') { return [pluginInfo]; }
	if (typeof pluginInfo === 'string') {
		const plugin = await findPlugin(cwd, fileDir, pluginInfo);
		return plugin ? [plugin] : null;
	}
	if (!Array.isArray(pluginInfo)) { return null; }
	const [p, cfg] = pluginInfo;
	if (typeof p === 'function') { return [p, cfg]; }
	if (typeof p !== 'string') { return null; }
	const plugin = await findPlugin(cwd, fileDir, p);
	return plugin ? [plugin, cfg] : null;
}

async function parsePlugins(
	cwd: string,
	filepath: string,
	plugins?:(string | Plugin<any> | [string | Plugin<any>, Record<string, any>])[]
): Promise<[Plugin, any?][]> {
	if (!plugins) { return [] }
	
	const fileDir = filepath.replace(/[\/\\]([^\\\/]+)$/g,'');
	if (!Array.isArray(plugins)) { return []; }
	const list = await Promise.all(plugins.map(p => parsePlugin(cwd, fileDir, p)))
	return list.filter(Boolean) as [Plugin, any?][];
}
export default async function start(
	filepath: string,
	cfg: any,
	watch: boolean,
) {
	const cwd = cfg?.cwd
		? pathFn.resolve(filepath, '..', cfg.cwd)
		: filepath.replace(/[\/\\](package|\.exourcerc|exource\.config|config[\/\\]exource)\.(m?js|ya?ml|json5?)$/i,'');
	const api = await exource({
		cwd,
		root: cfg.root,
		moduleDir: cfg.moduleDir,
		output: cfg.output,
		watch,
	})
	for (const [p, c] of await parsePlugins(cwd, filepath, cfg.plugins)) {
		await api.plugin(p, c);
	}
}
