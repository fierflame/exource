import { RouteCfg, Route, HandlerApi } from '../types';

export default function (
	route: Route,
	cfg: RouteCfg,
	api: HandlerApi,
) {
	api.ignore('authority');
	const { authority } = cfg;

	if (Array.isArray(authority)) {
		if (authority.length) {
			route.authority = authority;
		}
	} else if (authority && typeof authority === 'string') {
		route.authority = [authority];
	}

}
