import type { Api } from 'exource';
import { ignoreFn } from 'exource'
import type { Handler } from './types';
import merge from './merge';
export type {
	HandlerApi, Handler,
	RouteCfg, Route, RouteCfgList,
	RouteMenuCfg, RouteMenu,
	RouteAuthorityCfg, RouteAuthority,
} from './types'
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
	imports: importList,
}: {
	path?: string | string[];
	e404?: string;
	main?: string;
	imports?: string[] | Record<string, boolean>;
} = {}) {
	const handlers = api.get<Handler>('handler:routes-config');
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
		api.emit('cfg:routes', merge(
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
