import { Api } from 'exource';
import { Handler } from 'exource/routes-config';

export default async function handler(api: Api) {
	api.emit<Handler>('routes-config-handler', (route, cfg, handlerApi) => {
		handlerApi.ignore('authority');
		const { authority } = cfg;
	
		if (Array.isArray(authority)) {
			if (authority.length) {
				route.authority = authority;
			}
		} else if (authority && typeof authority === 'string') {
			route.authority = [authority];
		}
	})
}

handler.id = 'exource/routes-config-handler-authority';
handler.tag = 'routes-config-handler-authority';
