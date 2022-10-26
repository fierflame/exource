import type { Api } from 'exource';
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
	const filepath = path || `{${api.moduleDir}/*,${api.root}}/routes`;
	const e404Path = e404 && typeof e404 === 'string'
		? './'.includes(e404[0]) ? e404 :`./${e404}`
		: undefined
	function handle(cfg: any) {
		if (typeof cfg !== 'object') { return; }
		return Array.isArray(cfg) ? {main: cfg} : cfg;
	}
	function update(routes: Record<string, any>) {
		api.emit('cfg:routes', merge(routes, handlers, main, imports, e404Path));
	}
	api.scanCfg(
		filepath,
		{handle},
		(_path, _cfg, all) => update(all),
		all => update(all),
	);
}

routes.id = 'exource/routes-config';
routes.tag = 'routes';
