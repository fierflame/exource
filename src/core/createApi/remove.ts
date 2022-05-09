import * as fsPromises from 'node:fs/promises';
import * as pathFn from 'node:path';
import logger from '../logger';
export default async function remove(
	outputRoot: string,
	plugin: string,
	path: string,
) {
	const abs = pathFn.resolve(outputRoot, path)
	logger(0, plugin, 'remove', `${path}`);
	try {
		await fsPromises.rm(abs, {recursive: true});
		return true;
	} catch {
		return false;
	}
}
