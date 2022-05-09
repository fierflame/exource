import * as fsPromise from 'node:fs/promises'
import * as pathFn from 'node:path'
import * as json5 from 'json5'
import * as yaml from 'yaml'
import logger from '../logger';
export default async function readCfg(
	cwd: string,
	plugin: string,
	path: string,
): Promise<any> {
	try {
		const ext = pathFn.extname(path);
		const isYml = ['.yml', '.yaml'].includes(ext);
		const text = await fsPromise.readFile(pathFn.resolve(cwd, path), 'utf8');
		const obj = isYml ? yaml.parse(text, {}) : json5.parse(text)
		if (!obj) { return {}}
		if (typeof obj !== 'object') { return {}}
		return obj;
	} catch(e) {
		const err = e as Error;
		logger(2, plugin, 'readCfg', `配置文件读取异常: ${path}\n${err.name}: ${err.message}`);
		return null;
	}
}
