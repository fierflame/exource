import { Route } from '../routes-config/types';
import createRedirectCode from './createRedirectCode';
import { ComponentPropConfig } from './types';

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

function getRoutePath(
	parentPath: string,
	allMatchPath: string,
	path?: string,
) {
	if (path && path[0] === '/') { return path; }
	return `${parentPath.replace(/\/+$/, '')}/${(path || allMatchPath).replace(/^\/+/, '')}`
}



function createComponentImporter(getPath: (path: string)=> string, importCodes: string[]) {
	const components= new Map<string, string>();
	return function importComponent(path: string) {
		const importPath = getPath(path)
		const importPathText = JSON.stringify(importPath);
		let name = components.get(path);
		if (name) { return name;}
		name = `c${components.size}`;
		components.set(path, name);
		importCodes.push(`import ${name} from ${importPathText}`);
		return name;
	}
}
export default function transform(
	getPath2: (path: string)=> string,
	list: Route[],
	allMatchPath: string,
	componentProps: Record<string, boolean | ComponentPropConfig>,
	isVue3: boolean,
	lazy?: boolean,
) {
	let useRedirect = false;
	let useRouterView = false;
	let useDefineAsyncComponent = false;

	const importCodes: string[] = [];
	const importComponent = createComponentImporter(getPath2, importCodes);

	function getVue2PropComponent(path: string, prop: ComponentPropConfig | boolean) {
		if (!prop) { return importComponent(path); }
		const script = `() => import(${JSON.stringify(getPath2(path))})`;
		if (prop === true) { return script }
		const { delay, timeout, errorComponent, loadingComponent } = prop;
		return [`{`,
			`component: ${script},`,
			delay && `delay: ${JSON.stringify(delay)},`,
			timeout && `timeout: ${JSON.stringify(timeout)},`,
			errorComponent && `error: ${importComponent(errorComponent)},`,
			loadingComponent && `loading: ${importComponent(loadingComponent)},`,
		`}`].filter(Boolean).join('');
	}
	function getVue3PropComponent(path: string, prop: ComponentPropConfig | boolean) {
		if (!prop) { return importComponent(path); }
		useDefineAsyncComponent = true;
		const script = `() => import(${JSON.stringify(getPath2(path))})`;
		if (prop === true) { return `defineAsyncComponent(${script})`; }
		const { delay, timeout, errorComponent, loadingComponent } = prop;
		return [`defineAsyncComponent({`,
			`loader: ${script},`,
			delay && `delay: ${JSON.stringify(delay)},`,
			timeout && `timeout: ${JSON.stringify(timeout)},`,
			errorComponent && `errorComponent: ${importComponent(errorComponent)},`,
			loadingComponent && `loadingComponent: ${importComponent(loadingComponent)},`,
		`})`].filter(Boolean).join('');
	}
	const getPropsComponent = isVue3 ? getVue3PropComponent : getVue2PropComponent;

	function getComponentCode(path: string) {
		if (!lazy) { return importComponent(path); }
		return `() => import(${JSON.stringify(getPath2(path))})`;
	}




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
		const thisPath = getRoutePath(parentPath, allMatchPath, path)
		yield `${space(deep)}path: ${JSON.stringify(thisPath)},`
		if (name) {
			yield `${space(deep)}name: ${JSON.stringify([...names, name].filter(Boolean).join('.'))},`
		}
	
		if (redirect) {
			useRedirect = true;
			yield `${space(deep)}redirect: createRedirect(${JSON.stringify(String(redirect))}),`
		}
	
		const childDeep = deep + 1;
	
		yield `${space(deep)}components: {`
		if (!components || !('default' in components)) {
			useRouterView = true;
			yield `${space(childDeep)}default: RouterView,`
		}
		for (const [name, component] of Object.entries(components || {})) {
			yield `${space(childDeep)}${JSON.stringify(name)}: ${getComponentCode(component)},`
		}
		yield `${space(deep)}},`
	
		yield `${space(deep)}meta: {`
		for(const [name, value] of Object.entries(meta)) {
			if (name in componentProps && value && typeof value === 'string') {
				yield `${space(childDeep)}${JSON.stringify(name)}: ${getPropsComponent(value, componentProps[name])},`
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
	if (useDefineAsyncComponent) { importCodes.push(); }

	const code = [...transformList(list, '/', 0, [])].join('\n');
	return [
		useDefineAsyncComponent && `import { defineAsyncComponent } from 'vue';`,
		useRouterView && `import { RouterView } from 'vue-router';`,
		...importCodes,
		useRedirect && createRedirectCode,
		`export default ${code}`
	].filter(Boolean).join('\n')
	
}
