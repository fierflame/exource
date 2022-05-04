import { RouteCfg, RouteCfgList, Route, Handler } from './types';
import * as pathFn from 'node:path/posix'

function getPath(file: string, path: string) {
	if (path && path[0] === '/') {
		return pathFn.join(path).substring(1);
	}
	return pathFn.join('/', file, '..', path).substring(1);
}
function getComponents(
	file: string,
	component?: string,
	components?: Record<string, string>,
) {
	const all: Record<string, string> = {};
	if (components) {
		for (const [key, path] of Object.entries(components)) {
			all[key] = getPath(file, path)
		}
	}
	if (component) {
		all.default = getPath(file, component);
	}
	return all;
}

function getRoutePath(parent: string, path?: string): string {
	if (!path) {
		return parent || '/';
	} else if (path[0] === '/') {
		return path;
	} else if (/\.+\//.test(path)) {
		const index = path.indexOf('/');
		return `${parent}/${index < 0 ? path : path.substring(index + 1)}`;
	} else {
		return `${parent}/${path}`;
	}
}
function getParentPath(path: string): string {
	const index = path.length - 1;
	if (path[index] === '/') { return path.substring(0, index)}
	return path;
}


function runHandlers(
	route: Route,
	cfg: RouteCfg,
	filepath: string,
	handlers: Handler[],
) {
	const ignores = new Set<string>();
	function ignore(...props: string[]) {
		for(const p of props) { ignores.add(p); }
	}
	const resolvePath = getPath.bind(null, filepath);
	for (const handler of handlers) {
		handler(route, {...cfg}, { ignore, resolvePath });
	}
	ignore('path', 'order', 'children', 'redirect', 'component', 'components');
	const cc = {...cfg};
	for (const ig of ignores) { delete cc[ig]; }
	return { ...cc, ...route } as Route;

}
function isRecursion(it: string | object, all: [string | object, string][]) {
	if (!all.find(([n]) => n === it)) { return false; };
		// TODO: 递归引用报错
	return true;
}

export default function merge(
	all: Record<string, Record<string, any[]>>,
	handlers: Handler[],
	main: string,
	e404?: string,
) {
	function *list(name: string, parent: string, names: [string | object, string][]) {
		for (const [path, map] of Object.entries(all)) {
			const list = name in map && map[name]
			if (!Array.isArray(list)) { continue; }
			const newNames: [string | object, string][] = [...names, [name, path]];
			for (const r of list) {
				const v = get(r, path, parent, newNames)
				if (v) { yield v; }
			}
		}
	}
	function getList(name: string, parent: string, names: [string | object, string][]) {
		if (isRecursion(name, names)) { return []; };
		return [...list(name, parent, names)].sort(
			({ order: a }, { order: b }) => (Number(a) || 0) - (Number(b) || 0)
		)
	}
	function *getChildren(
		children: RouteCfgList,
		file: string,
		parent: string,
		names: [string | object, string][]
	): Iterable<Route> {
		for (const route of children) {
			if (typeof route === 'string') {
				yield* getList(route, parent, names);
				continue;
			}
			if (route === 404) {
				if (e404) { yield { component: e404, components: {default: e404} }; }
				continue;
			}
			if (typeof route === 'number') { continue; }
			const v = get(route, file, parent, names);
			if (v) { yield v; }
		}
	}
	function get(
		cfg: RouteCfg,
		filepath: string,
		parent: string,
		names: [string | object, string][],
	): Route | undefined {
		if (isRecursion(cfg, names)) { return; };

		const { order, path, children, component, components, redirect } = cfg;
		const route: Route = { order };
		const routePath = getRoutePath(parent, path); 
		route.path = routePath
		let hasChildren = false;
		if (children) {
			const list= [...getChildren(
				children,
				filepath,
				getParentPath(routePath),
				[...names, [cfg, filepath]],
			)];
			route.children = list
			hasChildren = Boolean(list.length);
		}
		if (redirect) {
			route.redirect = redirect;
		} else if (components || component) {
			const allComponents = getComponents(filepath, component, components)
			route.components = allComponents;
			route.component = allComponents.default;
		} else if (!hasChildren && e404) {
			route.component = e404;
			route.components = {default: e404};
		}
		return runHandlers(route, cfg, filepath, handlers);
	}
	return getList(main, '', []);
}
