import * as fsPromises from 'node:fs/promises';
import * as pathFn from 'node:path';
import logger from './logger';
export default async function write(
	outputRoot: string,
	plugin: string,
	path: string,
	any: any,
) {
	const abs = pathFn.resolve(outputRoot, path)
	try {
		await fsPromises.mkdir(pathFn.dirname(abs), {recursive: true});
	} catch {}
	try {
		fsPromises.writeFile(abs, any)
		logger(0, plugin, 'write', `${path}`);
		return true
	} catch {
		logger(2, plugin, 'write', `${path}`);
		return false;
	}
}
