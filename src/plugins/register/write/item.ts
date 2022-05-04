import { Api } from 'exource';
import { DefineFileProp } from '../types';
import { PropInfo } from '../mergeDefine';

function createExport(name: string, exp: string) {
	if (name === 'default') {
		return `export default ${exp};`;
	}
	return `export const ${name} = ${exp};`;
}
function createFileExport(
	name: string,
	path: string,
	prop: DefineFileProp,
): string {
	
	if (prop.lazy) {
		if ((['vue3', 'react', 'component'].includes(prop.kind))) {
			return createExport(name, `() => import(${JSON.stringify(path)}).then(r => r.default)`);
		}
		if (prop.async) {
			return createExport(name, `(...p) => import(${JSON.stringify(path)}).then(r => r.default(...p))`);
		}
	}
	return `export { default as ${name} } from ${JSON.stringify(path)};`;
}


function selectCfg(
	name: string,
	cfg: Map<string, any>,
) {
	const value = new Map<string, any>();
	for (let [path, config] of cfg) {
		if (!config) { continue;}
		if (typeof config !== 'object') { continue;}
		if (!(name in config)) { continue; }
		value.set(path, config[name]);
	}
	return value;
}
function generate(
	api: Api,
	register: string,
	key: string,
	props: Record<string, PropInfo>,
	config?: Map<string, any>,
	files?: Map<string, Set<string>>,
) {
	const scripts: string[] = [];
	for (const [name, prop] of Object.entries(props)) {
		if (prop.kind !== 'config') {
			if (!files) { continue; }
			const paths = files.get(name)
			if (!paths) { continue; }
			const [path] = paths
			if (!path) { continue; }
			scripts.push(createFileExport(name, api.relativePath(`register/${register}/items`, path, true), prop));
			if (paths.size <= 1) { continue; }
			api.logger.tag('props').warn([`注册器 '${register}' -> '${key}'的文件属性 '${name}' 对应多个文件:`, ...paths].join('\n    '))
			continue;
		}
		if (!config) { continue; }
		const cfg = selectCfg(name, config);
		const [value] = cfg;
		if (!value) { continue; }
		scripts.push(createExport(name, JSON.stringify(value[1])))
		if (cfg.size <= 1) { continue; }
		api.logger.tag('props').warn([`注册器 '${register}' -> '${key}'的属性 '${name}' 在多个配置文件中能有定义:`, ...cfg].join('\n    '))
	}
	return scripts.join('\n')
}

export default async function writeItem(
	api: Api,
	register: string,
	key: string,
	props: Record<string, PropInfo>,
	config?: Map<string, any>,
	files?: Map<string, Set<string>>,
) {
	const script = generate(api, register, key, props, config, files)
	if (!script) { return false; }
	await api.write(`registers/${register}/items/${key}.js`, script);
	await api.write(`registers/${register}/items/${key}.d.ts`, script);
	return true;
}
