
const createRedirect = `
function replaceParams(path, params) {
	return path.replace(/\\\\(.)|:([a-zA-Z_][a-zA-Z_0-9]*)/g, (_, s, k) => s || (k in params ? params[k] : \`:\${k}\`));
}
function createRedirect(redirect) {
	return ({ params, matched }) => {
		let path = replaceParams(redirect, params)
		for (let i = matched.length - 2; path[0] !== '/' && i >= 0; i--) {
			let mp = matched[i]?.path;
			if (!mp || mp === '*') { continue; }
			const pp = replaceParams(mp, params)
			if (!pp) { continue; }
			path = path ? \`\${pp}/\${path}\` : pp;
		}
		path = \`/\${path}\`.replace(/\\/(\\.?\\/)+/g, '/');
		for(;;) {
			const newPath = path.replace(/\\/[^.][^/]*\\/\\.\\.(?=\\/|\$)/g, '').replace(/^\\/(\\.\\.\\/)+/g, '/');
			if (newPath === path) { return path;}
			path = newPath
		};
	};
}
`
export default createRedirect
