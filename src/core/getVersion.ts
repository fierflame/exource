import * as fsPromise from 'node:fs/promises'
import resolve from 'resolve'
export default async function getVersion(cwd: string, pkg: string) {
	const path = await new Promise<string>((r) => {
			resolve(`${pkg}/package.json`, {
				basedir: cwd
			}, (err, res) => r(err ? '' : res || ''));
	});
	if (!path) {
		return '';
	}
	try {
		const json = await fsPromise.readFile(path, 'utf8')
		const { version } = JSON.parse(json);
		if (typeof version !== 'string') {
			return '';
		}
		return version;
	} catch {
		return '';
	}
}
