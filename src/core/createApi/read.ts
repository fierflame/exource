import * as fsPromise from 'node:fs/promises'
import * as pathFn from 'node:path'
export default async function read(
	cwd: string,
	plugin: string,
	path: string,
	encoding?: null | BufferEncoding,
) {
	const abs = pathFn.resolve(cwd, path)
	try {
		if (encoding && typeof encoding === 'string') {
			return await fsPromise.readFile(abs, encoding);
		}
		return await fsPromise.readFile(abs);
	} catch(e) {
		return null;
	}
}
