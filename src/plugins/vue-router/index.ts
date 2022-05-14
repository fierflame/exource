
import type { Api } from 'exource';
import getComponentProps from './getComponentProps';
import writeRoutes from './writeRoutes';
import type { Options } from './types'
export type { Options, ComponentPropConfig } from './types'

const routesType = `\
import { RouteRecordRaw } from 'vue-router';
declare const T: RouteRecordRaw[];
export default T;
`

const indexType = `\
import { Router } from 'vue-router';
declare const router: Router;
export default router;
`

function createIndex(baseScript?: string) {
	return `\
import {createRouter, createWebHistory } from 'vue-router';
import routes from './routes';

const router = createRouter({
	history: createWebHistory(${baseScript || ''}),
	routes,
})
export default router;
`;
}


export default async function router(api: Api, {
	base, baseScript,
	componentProps, allMatchPath, lazy,
	delay, timeout, errorComponent, loadingComponent,
}: Options) {
	await api.write('vue-router/routes.d.ts', routesType);
	await api.write('vue-router/routes.js', 'export default []');
	await api.write('vue-router/index.d.ts', indexType);
	await api.write('vue-router/index.js', createIndex(base ? JSON.stringify(base) : baseScript));
	api.setImport({'./vue-router': 'vueRouter'});
	const props = getComponentProps({
		delay, timeout, errorComponent, loadingComponent,
	}, componentProps, lazy);
	writeRoutes(api, props, lazy, allMatchPath);
}
router.id = 'exource/vue-router';
router.tag = 'router';
