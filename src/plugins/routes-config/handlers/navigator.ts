import { Route, RouteCfg, HandlerApi } from '../types';

function toLocaleName(v: string) {
	const r = /^([a-z]{2})[_-]?([a-z]*)/i.exec(v);
	if (!r) { return; }
	const [, n, g] = r;
	if (g) { return `${n.toLowerCase()}-${g.toUpperCase()}`}
	return n.toLowerCase();
}
function localeMap(v: any) {
	if (!v) { return; }
	if (typeof v !== 'object') { return; }
	const map = {};
	for (const [k, t] of Object.entries(v)) {
		const name = toLocaleName(k);
		if (!name) { continue; }
		if (!t) { continue; }
		if (typeof t !== 'string') { continue; }
		map[name] = t;
	}
	if (Object.keys(map).length) { return map; }
	return;
}

function getTitle(
	title: any,
	names: string[],
	name?: string,
): [string, (string | Record<string, string>)?] | void {
	if (Array.isArray(title)) {
		const [t, l] = title;
		const def = t && typeof t === 'string' ? t : name;
		if (!def) { return; }
		if (l && typeof l === 'string') { return [def, l]; }
		const lm = localeMap(l);
		if (lm) { return [def, lm]}
		return name ? [def, ['navigator', ...names, name].filter(Boolean).join('.')] : [def];
	}
	if (title && typeof title === 'object') {
		if (!name) { return; }
		const lm = localeMap(title);
		if (lm) { return [name, lm]}
		return [name, ['navigator', ...names, name].filter(Boolean).join('.')]

	}
	const def = title && typeof title === 'string' ? title : name;
	if (!def) { return; }
	return name ? [def, ['navigator', ...names, name].filter(Boolean).join('.')] : [def];
}

function getEnum(types: string | string[], value: string | boolean | (string | boolean)[] = []) {
	const typesSet = new Set([types].flat().filter(v => v && typeof v === 'string'));
	const list: (string | boolean)[] = [];
	for (const v of [value].flat()) {
		if (typeof v === 'boolean') {
			list.push(v);
			break;
		}
		if (!typesSet.delete(v)) { continue; }
		list.push(v);
	}
	if (!list.length) { return true }
	if (list.length === 1) { return list[0] || false}
	return list;
}
function getIcon(api: HandlerApi, value: any, iconComponent?: boolean): string | [string, string?] | undefined{
	if (!value) { return; }
	if (typeof value === 'string') {
		return iconComponent && value.includes('/') ? api.resolvePath(value) : [value];
	}
	if (Array.isArray(value)) {
		const [icon, color] = value;
		if (!icon || typeof icon !== 'string') { return; }
		if (!color || typeof color !== 'string') { return [icon]; }
		return [icon, color];
	}
	if (typeof value !== 'object') { return }
	const {icon, color} = value;
	if (!icon || typeof icon !== 'string') { return; }
	if (!color || typeof color !== 'string') { return [icon]; }
	return [icon, color];
}
function getLink(value: any): string | void {
	if (!value) { return; }
	if (typeof value === 'string') { return value; }
}
export default function (
	route: Route,
	cfg: RouteCfg,
	api: HandlerApi,
	{
		iconComponent,
		menuTypes = ['children', 'only', 'tab'],
		breadcrumbTypes = ['children', 'only'],
		breadcrumbLinkTypes = ['always', 'auto'],
}: {
	iconComponent?: boolean;
	menuTypes?: string | string[];
	breadcrumbTypes?: string | string[];
	breadcrumbLinkTypes?: string | string[];
},
) {
	api.ignore('icon', 'title', 'link', 'menu', 'breadcrumb', 'breadcrumbLink');
	route.menu = getEnum(menuTypes, cfg.menu);
	route.breadcrumb = getEnum(breadcrumbTypes, cfg.breadcrumb);
	route.breadcrumbLink = getEnum(breadcrumbLinkTypes, cfg.breadcrumbLink);
	route.icon = getIcon(api, cfg.icon, iconComponent);
	route.title = getTitle(cfg.title, api.names, cfg.name);
	route.link = getLink(cfg.link);
}
