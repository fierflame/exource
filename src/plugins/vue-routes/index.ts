import { ignoreFn } from 'exource'
import type { Api } from 'exource';
import type { Route } from 'exource/routes-config';
import type { Options } from './types'
import getComponentProps from './getComponentProps';
import transform from './transform';
export type { Options, ComponentPropConfig } from './types'


const routesType = `\
import { RouteRecordRaw } from 'vue-router';
declare const T: RouteRecordRaw[];
export default T;
`

function getDefaultPath(version: string): string {
	return parseInt(String(version)) < 4 ? '*' : '/:_(.*)';
}
export default async function router(api: Api, {
	componentProps, allMatchPath, lazy,
	delay, timeout, errorComponent, loadingComponent,
}: Options) {
	await api.write('vue-router/routes.d.ts', routesType);
	await api.write('vue-router/routes.js', 'export default []');
	api.setImport({'./vue-router/routes': 'vueRoutes'});
	api.emit('file:vue-routes', './vue-router/routes');
	const props = getComponentProps({
		delay, timeout, errorComponent, loadingComponent,
	}, componentProps, lazy);
	const update = ignoreFn(async (list: Route[]) => {
		const matchPath = allMatchPath || getDefaultPath(await api.getVersion('vue-router'))
		const isVue3 = parseInt(String(await api.getVersion('vue'))) === 3;
		function getPath(path: string) {
			return path[0] === '.' ? api.relativePath('vue-router', path, true) : path;
		}
		const code = transform(getPath, list, matchPath, props, isVue3, lazy);
		await api.write('vue-router/routes.js', code);
	});
	api.listen<Route | Route[]>('routes', true, (...data) => {
		if (!data.length) { return; }
		update(data.flat());
	})
}
router.id = 'exource/vue-routes';
router.tag = 'routes';
