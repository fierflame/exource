import { Route } from '../routes-config/types';

function space(n: number) {
	if (!n) { return ''; }
	return Array(n).fill('\t').join('');
}
function addSpace(text: string, n: number, begin?: boolean) {
	if (begin) {
		return String(text).split('\n').map(v =>`${space(n)}${v}`).join('\n');
	}
	const [b, ...t] = String(text).split('\n');
	return [b, ...t.map(v =>`${space(n)}${v}`)].join('\n');
}

function getPath(
	parentPath: string,
	allMatchPath: string,
	path?: string,
) {
	if (path && path[0] === '/') { return path; }
	return `${parentPath.replace(/\/+$/, '')}/${(path || allMatchPath).replace(/^\/+/, '')}`
}
export default function transform(
	list: Route[],
	getComponentCode:(path: string, isCustomize?: boolean) => string,
	allMatchPath: string,
	componentProps: Set<string>,
) {
	

	function *transformItem(
		parentPath: string, 
		{
			path,
			children,
			components,
			component,
			redirect,
			name,
			...meta
		}: Route,
		deep: number,
		names: string[],
	): Iterable<string> {
		const thisPath = getPath(parentPath, allMatchPath, path)
		yield `${space(deep)}path: ${JSON.stringify(thisPath)},`
		if (name) {
			yield `${space(deep)}name: ${JSON.stringify([...names, name].filter(Boolean).join('.'))},`
		}
	
		if (redirect) {
			yield `${space(deep)}redirect: createRedirect(${JSON.stringify(String(redirect))}),`
		}
	
		const childDeep = deep + 1;
	
		yield `${space(deep)}components: {`
		if (!components || !('default' in components)) {
			yield `${space(childDeep)}default: RouterView,`
		}
		for (const [name, component] of Object.entries(components || {})) {
			yield `${space(childDeep)}${JSON.stringify(name)}: ${getComponentCode(component)},`
		}
		yield `${space(deep)}},`
	
		yield `${space(deep)}meta: {`
		for(const [name, value] of Object.entries(meta)) {
			if (componentProps.has(name) && value && typeof value === 'string') {
				yield `${space(childDeep)}${JSON.stringify(name)}: ${getComponentCode(value, true)},`
			} else {
				yield `${space(childDeep)}${JSON.stringify(name)}: ${addSpace(JSON.stringify(value, null, '\t'), childDeep)},`
			}
		}
		yield `${space(deep)}},`
	
		yield *transformList(children, thisPath, deep, [...names, name || ''], true);
	}
	function *transformList(
		list: Route[] | undefined,
		path: string,
		deep: number,
		names: string[],
		children?: boolean,
	) {
		if (!list) { return; }
		if (!list.length) {
			yield children ? `${space(deep)}children: [],` : `${space(deep)}[]`;
			return;
		}
		const childDeep = deep + 1;
		yield children ? `${space(deep)}children: [{`: `[{`;
		for (let i = 0; i< list.length;i++) {
			if (i) { yield `${space(deep)}}, {` }
			yield * transformItem(path, list[i], childDeep, names);
		}
		yield children ? `${space(deep)}}],` : `${space(deep)}}]`;
	
	}
	return [...transformList(list, '/', 0, [])].join('\n');
}
