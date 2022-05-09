import glob from 'fast-glob';

export default async function(cwd: string, path: string | string[]) {
	try {
		return await glob(path, {cwd})
	} catch(e) {
		return [];
	}
};
