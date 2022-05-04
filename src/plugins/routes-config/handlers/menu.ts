import { Route, RouteCfg, HandlerApi } from '../types';

const menuValues = new Set([false, true, 'only', 'children']);

export default function (
	route: Route,
	cfg: RouteCfg,
	api: HandlerApi,
) {
	api.ignore('icon', 'title', 'link', 'menu');
	const { title, icon, menu = true, link } = cfg;

	route.menu = menuValues.has(menu) ? menu : true;
	route.link = link;

	if (title) { route.title = Array.isArray(title) ? title : [title]; }
	if (icon) {
		if (typeof icon === 'string') {
			if (icon.includes('/')) {
				route.icon = [icon];
			} else {
				route.icon = api.resolvePath(icon);
			}
		} else if (Array.isArray(icon)) {
			route.icon = icon;
		} else if (typeof icon === 'object') {
			route.icon = [icon.icon, icon.color];
		}
	}

}
