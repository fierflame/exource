
import type { Api } from 'exource';
import { ignoreFn } from 'exource'
import type { Handler } from './types';
import merge from './merge';
import * as handlers from './handlers';
export * from './handlers';
export type {
	HandlerApi, Handler,
	RouteCfg, Route, RouteCfgList,
	RouteMenuCfg, RouteMenu,
	RouteAuthorityCfg, RouteAuthority,
} from './types'
function getHandlerFn(h: any): Handler | null {
	if (typeof h === 'function') { return h; }
	if (typeof h !== 'string') { return null; }
	const handler = h in handlers && handlers[h]
	return handler || null;
}

function getHandler(
	v?: string | Handler | [string | Handler, Record<string, any>]
): [Handler, Record<string, any>] | null{
	const handler = Array.isArray(v) ? getHandlerFn(v[0]) : getHandlerFn(v);
	if (!handler) { return null }
	const opt = Array.isArray(v) && typeof v[1] === 'object' && v[1] || {}
	return [handler, opt]
}
function getHandlers(
	v?: string | Handler | (string | Handler | [string | Handler, any])[] | Record<string, any>
): [Handler, Record<string, any>][] {
	if (!v) { return []}
	const fn = getHandlerFn(v);
	if (fn) { return [[fn, {}]] }
	if (typeof v !== 'object') { return []; }
	
	const list = Array.isArray(v) ? v : Object.entries(v);
	return list.map(h => getHandler(h)).filter(Boolean) as [Handler, Record<string, any>][];
}
function getImports(
	value?: string[] | Record<string, boolean>
) {
	const imports: Record<string, boolean> = {};
	if (!value) { return imports}
	if (typeof value !== 'object') { return imports; }
	if (Array.isArray(value)) {
		for (const n of value) {
			if (!n || typeof value !== 'string') { continue; }
			imports[n] = false;
		}
		return imports;
	}
	for (const [p, v] of Object.entries(value)) {
		if (!p) { continue; }
		if (typeof v === 'boolean') { imports[p] = v; }
	}
	return imports;
}
export default async function routes(api: Api, {
	e404,
	main = 'main',
	path,
	handlers: handlerList,
	imports: importList,
}: {
	path?: string | string[];
	e404?: string;
	main?: string;
	handlers?: string | Handler | (string | Handler | [string | Handler, any])[] | Record<string, any>;
	imports?: string[] | Record<string, boolean>;
} = {}) {
	const handlers = getHandlers(handlerList);
	const imports = getImports(importList);
	const filepath = path || `{${api.moduleDir}/*,${api.root}}/routes`
	let updatedAll = false;
	api.scanCfg(filepath, ignoreFn((all, path, cfg, merged) => {
		if (merged) {
			if (updatedAll) { return; }
			updatedAll = true;
		}
		const routeMap: Record<string, Record<string, any>> = Object.create(null);
		for (const [path, cfg] of Object.entries(all)) {
			if (typeof cfg !== 'object') { continue; }
			routeMap[path] = Array.isArray(cfg) ? {main: cfg} : cfg;
		}
		api.emit('routes', merge(
			routeMap,
			handlers,
			main,
			imports,
			e404 && typeof e404 === 'string' ? './'.includes(e404[0]) ? e404 :`./${e404}` : undefined,
		));
	}))
}

routes.id = 'exource/routes-config';
routes.tag = 'routes';
