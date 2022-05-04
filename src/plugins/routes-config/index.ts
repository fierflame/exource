
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

function getHandlers(v?: string | Handler | (string | Handler)[]): Handler[] {
	const list = new Set<Handler>();
	if (typeof v === 'string') {
		const handler = v in handlers && handlers[v]
		if (handler) { list.add(handler); }
	} else if (typeof v === 'function') {
		list.add(v)
	} else if (Array.isArray(v)) {
		for (const h of v) {
			if (typeof h === 'function') {
				list.add(h)
				continue;
			}
			if (typeof h === 'string') {
				const handler = h in handlers && handlers[h]
				if (handler) { list.add(handler); }
			}
		}
	}
	return [...list];
}
export default async function routes(api: Api, {
	e404,
	main = 'main',
	path,
	handlers: handlerList,
}: {
	path?: string | string[];
	e404?: string;
	main?: string;
	handlers?: string | Handler | (string | Handler)[]
} = {}) {
	const handlers = getHandlers(handlerList);
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
		api.emit('routes', merge(routeMap, handlers, main, e404));
	}))
}

routes.id = 'exource/routes-config';
routes.tag = 'routes';
