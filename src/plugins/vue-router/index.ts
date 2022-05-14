
import type { Api } from 'exource';
import { ignoreFn } from 'exource'
import getComponentProps from './getComponentProps';
import type { Options } from './types'
import type { Route } from 'exource/routes-config';
import transform from './transform';
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


function getDefaultPath(version: string): string {
	return parseInt(String(version)) < 4 ? '*' : '/:_(.*)';
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
	const update = ignoreFn(async (list: Route[]) => {
		const matchPath = allMatchPath || getDefaultPath(await api.getVersion('vue-router'))
		const isVue3 = parseInt(String(await api.getVersion('vue'))) === 3;
		function getPath(path: string) {
			return path[0] === '.' ? api.relativePath('vue-router', path, true) : path;
		}
		const code = transform(getPath, list, matchPath, props, isVue3, lazy);
		await api.write('vue-router/routes.js', code);
	});
	api.listen('routes', true, data => {
		if (!data) { return; }
		update(data);
	})
}
router.id = 'exource/vue-router';
router.tag = 'router';
