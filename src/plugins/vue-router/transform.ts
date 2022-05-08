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
	name,
	...meta
}: Route,
getComponentCode:(path: string) => string,
componentProps: Set<string>,
deep: number,
): Iterable<string> {
	yield `${space(deep)}path: ${JSON.stringify(path || '*')},`
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

	yield *transformList(children, getComponentCode, componentProps, deep, true);
}
function *transformList(
	list: Route[] | undefined,
	getComponentCode:(path: string) => string,
	componentProps: Set<string>,
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
		yield * transformItem(list[i], getComponentCode, componentProps, childDeep);
	}
	yield children ? `${space(deep)}}],` : `${space(deep)}}]`;

}
function getComponentProps(v: any) {
	if (v && typeof v === 'string') { return new Set([v]); }
	if (Array.isArray(v)) {
		return new Set(v.filter(v => v && typeof v === 'string'));
	}
	return new Set();
}
export default function transform(
	list: Route[],
	getComponentCode:(path: string) => string,
	componentProps?: string | string[],
) {

	return [...transformList(
		list,
		getComponentCode,
		getComponentProps(componentProps),
		0,
	)].join('\n');
}
