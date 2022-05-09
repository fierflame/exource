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
export default function transform(
	list: Route[],
	getComponentCode:(path: string) => string,
	allMatchPath: string,
	componentProps: Set<string>,
) {
	

	function *transformItem({
		path,
		children,
		components,
		component,
		redirect,
		name,
		...meta
	}: Route,
	deep: number,
	): Iterable<string> {
		yield `${space(deep)}path: ${JSON.stringify(path || allMatchPath)},`
		if (name) {
			yield `${space(deep)}name: ${JSON.stringify(name)},`
		}
	
		if (redirect) {
			yield `${space(deep)}redirect: ${JSON.stringify(redirect)},`
		}
	
		const childDeep = deep + 1;
	
		if (components) {
			yield `${space(deep)}components: {`
			for (const [name, component] of Object.entries(components)) {
				yield `${space(childDeep)}${JSON.stringify(name)}: ${getComponentCode(component)},`
			}
			yield `${space(deep)}},`
		}
	
		yield `${space(deep)}meta: {`
		for(const [name, value] of Object.entries(meta)) {
			if (componentProps.has(name) && value && typeof value === 'string') {
				yield `${space(childDeep)}${JSON.stringify(name)}: ${getComponentCode(value)},`
			} else {
				yield `${space(childDeep)}${JSON.stringify(name)}: ${addSpace(JSON.stringify(value, null, '\t'), childDeep)},`
			}
		}
		yield `${space(deep)}},`
	
		yield *transformList(children, deep, true);
	}
	function *transformList(
		list: Route[] | undefined,
		deep: number,
		children?: boolean,
	) {
		if (!list) { return; }
		if (!list.length) {
			yield children ? `${space(deep)}children: [],` : `${space(deep)}[],`;
			return;
		}
		const childDeep = deep + 1;
		yield children ? `${space(deep)}children: [{`: `[{`;
		for (let i = 0; i< list.length;i++) {
			if (i) { yield `${space(deep)}}, {` }
			yield * transformItem(list[i], childDeep);
		}
		yield children ? `${space(deep)}}],` : `${space(deep)}}]`;
	
	}
	return [...transformList(list, 0)].join('\n');
}
