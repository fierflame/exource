import { Route } from '../routes-config/types';

function space(n: number) {
	if (!n) { return ''; }
	return Array(n).fill('\t').join('');
}
function addSpace(text: string, n: number, begin?: boolean) {
	if (begin) {
		return text.split('\n').map(v =>`${space(n)}${v}`).join('\n');
	}
	const [b, ...t] = text.split('\n');
	return [b, ...t.map(v =>`${space(n)}${v}`)].join('\n');
}
function *transformItem({
	path,
	children,
	components,
	component,
	redirect,
	...meta
}: Route,
getComponentCode:(path: string) => string,
deep: number,
): Iterable<string> {
	yield `${space(deep)}path: ${JSON.stringify(path || '*')},`
	yield `${space(deep)}meta: ${addSpace(JSON.stringify(meta, null, '\t'), deep)},`
	if (redirect) {
		yield `${space(deep)}redirect: ${JSON.stringify(redirect)},`
	}
	if (components) {
		yield `${space(deep)}components: {`
		for (const [name, component] of Object.entries(components)) {
			yield `${space(deep + 1)}${JSON.stringify(name)}: ${getComponentCode(component)},`
		}
		yield `${space(deep)}},`
	}
	yield *transformList(children, getComponentCode, deep, true);
}
function *transformList(
	list: Route[] | undefined,
	getComponentCode:(path: string) => string,
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
		yield * transformItem(list[i], getComponentCode, childDeep);
	}
	yield children ? `${space(deep)}}],` : `${space(deep)}}]`;

}
export default function transform(list: Route[], getComponentCode:(path: string) => string) {
	return [...transformList(list, getComponentCode, 0)].join('\n');
}
