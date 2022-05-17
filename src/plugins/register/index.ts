import type { Api } from 'exource';
import {ignoreFn, ignoreMapFn, onceFn} from 'exource';
import getMap from './getMap';
import getRegisterKey from './getRegisterKey';
import getRegisterName from './getRegisterName';
import mergeDefine, { RegisterInfo } from './mergeDefine';
import writeMain from './write/main';
import writeFilter from './write/filter';
import writeItem from './write/item';
import writeList from './write/list';
import writeLocale from './write/locale';
export type {
	ConfigPropKind, ConfigPropDefine,
	FilePropKind, DefineFileProp,
	MethodExportDefine,
	PropDefine, ExportDefine,
	Define,
} from './types'


function createDefines() {
	const defines = new Map<string, Map<string, any>>();
	return function getRegisterDefines(register: string): Map<string, any> {
		const d = defines.get(register);
		if (d) { return d };
		const map = new Map<string, any>();
		defines.set(register, map)
		return map;
	}
}
function joinPath(dir: string | string[], join: string) {
	if (!Array.isArray(dir)) { return `${dir}/${join}`; }
	return dir.map(d => `${d}/${join}`);
}
export default async function register(api: Api, {
	path
}: {
	path?: string | string[];
}) {
	const dirPath = path || `{${api.moduleDir}/*,${api.root}}/registers`;

	const getRegisterDefines = createDefines()
	function createRegisters(register: string) {
		let define: RegisterInfo = {files: new Set(), props: {}, exports: {}};

		const fileListeners = new Map<string, () => any>();
		/** {key: {path: cfg}} */
		const configs = new Map<string, Map<string, any>>();
		/** {key: {file: path}} */
		const files = new Map<string, Map<string, Set<string>>>();
		const items = new Set<string>();
		const generateList = ignoreFn(() => writeList(api, register, items))

		const generateKeyFile = ignoreMapFn(async (key: string) => {
			const config = configs.get(key)
			const file = files.get(key)
			const props = define.props
			const has = await writeItem(api, register, key, props, config, file);
			if (has === items.has(key)) { return; }
			if (has) { items.add(key); } else { items.delete(key); }
			generateList();
		});
		const updateFile = ignoreMapFn(async (path: string, unlink?: boolean) => {
			const keyInfo = getRegisterKey(path);
			if (!keyInfo) { return; }
			const [key, filename] = keyInfo;
			if (unlink) {
				const keyFiles = files.get(key);
				if (!keyFiles) { return }
				const filePaths = keyFiles?.get(filename);
				if (!filePaths?.has(path)) { return; }
				filePaths.delete(path)
				if (!filePaths.size) { keyFiles.delete(filename) }
				if (!keyFiles.size) { files.delete(key) }
			} else {
				const fileMap = getMap(files, key, () => new Map<string, Set<string>>())
				const set = getMap(fileMap, filename, () => new Set<string>())
				if (set.has(path)) { return; }
				set.add(path);
			}
			generateKeyFile(key);
		})
		const updateAllFile = ignoreMapFn(async (file: string, paths: string[]) => {
			const keys = new Set<string>()
			for (const path of paths) {
				const keyInfo = getRegisterKey(path);
				if (!keyInfo) { return; }
				const [key, filename] = keyInfo;
				keys.add(key);
				getMap(getMap(files, key, () => new Map), filename, () => new Set).add(path);
			}
			for (const key of keys) {
				generateKeyFile(key);
			}
		})
		function scanFile(file: string) {
			const dir = joinPath(dirPath, `${register}/*/${file}{,/index}.{ts,tsx,js,jsx,vue}`)
			return api.scan(dir, (paths, path, unlink, merge) => {
				if (merge) { updateAllFile(file, paths); } else { updateFile(path, unlink); }
			});

		}
		const updateAllConfig = onceFn((paths: Record<string, any>) => {
			for (const [path, cfg] of Object.entries(paths)) {
				const keyInfo = getRegisterKey(path);
				if (!keyInfo) { return; }
				const [key] = keyInfo;
				getMap(configs, key, () => new Map).set(path, cfg);
			}
			for (const key of configs.keys()) {
				generateKeyFile(key);
			}
		})
		function scanConfig() {
			const file = joinPath(dirPath, `${register}/*/config`)
			return api.scanCfg(file, (all, path, cfg, merged) => {
				if (merged) { updateAllConfig(all); return}

				const keyInfo = getRegisterKey(path);
				if (!keyInfo) { return; }
				const [key] = keyInfo;
				if (!cfg) {
					const map = configs.get(key)
					if (!map?.has(path)) { return; }
					map.delete(path)
					if (!map.size) { configs.delete(key); }
				} else {
					getMap(configs, key, () => new Map).set(path, cfg);
				}
				generateKeyFile(key);
			});
		}
		return ignoreFn(async () => {
			const d = getRegisterDefines(register);
			if (!d.size) {
				for (const [,closeListener] of fileListeners) {
					closeListener()
				}
				fileListeners.clear();
				registers.delete(register)
				api.remove(`registers/${register}`);
				return;
			}
			define = mergeDefine(api, register, [...d.entries()]);
			await generateList();
			await writeMain(api, register, define);

			/** 更新文件监听 */
			const propFiles = define.files
			for (const file of propFiles) {
				if (fileListeners.has(file)) { continue; }
				const closeListener = !file ? scanConfig() : scanFile(file)
				fileListeners.set(file, closeListener)
			}
			for (const [name, closeListener] of fileListeners) {
				if (propFiles.has(name)) { continue; }
				closeListener()
			}
		});
	}
	const registers = new Map<string, () => Promise<void>>();

	const update = ignoreMapFn(async (register: string) => {
		let run = registers.get(register);
		if(!run) {
			run = createRegisters(register);
			registers.set(register, run);
		}
		await run();
	});
	const updateAll = onceFn((all: Record<string, any>) => {
		const registers = new Set<string>();
		for (const [path, cfg] of Object.entries(all)) {
			const register = getRegisterName(path);
			if (!register) { continue; }
			const registerDefines = getRegisterDefines(register);
			registerDefines.set(path, cfg);
			registers.add(register)
		}
		for (const register of registers) {
			update(register);
		}
	})
	api.listen<string>('localeGetter', true, ignoreFn(v => writeLocale(api, v)));
	await writeFilter(api);
	
	api.scanCfg(joinPath(dirPath, '*'), (all, path, cfg, merged) => {
		if (merged) { updateAll(all); return; }
		const register = getRegisterName(path);
		if (!register) { return; }
		const registerDefines = getRegisterDefines(register);
		if (!cfg) {
			if (!registerDefines.has(register)) { return; }
			registerDefines.delete(register);
		} else {
			registerDefines.set(path, cfg);
		}
		update(register);
	})
}

register.id = 'exource/register';
register.tag = 'register';
