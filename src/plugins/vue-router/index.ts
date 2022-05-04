
import type { Api } from 'exource';
import { ignoreFn } from 'exource'
import { Route } from '../routes-config/types';
import transform from './transform';
const indexType = `\
import { Router } from 'vue-router';
declare const router: Router;
export default router;
`
const routesType = `\
import { RouteRecordRaw } from 'vue-router';
declare const T: RouteRecordRaw[];
export default T;
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
	lazy,
	base,
	baseScript,
}: {
	lazy?: boolean;
	base?: string;
	baseScript?: string;
}) {
	if (base) {
		baseScript = JSON.stringify(base);
	}
	const update = ignoreFn(async (list: Route[]) => {
		const components= new Map<string, string>();
		const importCodes: string[] = ["import { defineAsyncComponent } from 'vue'"];
		function getComponentCode(path: string) {
			const importPathText = JSON.stringify(api.relativePath('vue-router', path, true));
			if (lazy) { return `() => import(${importPathText})`}
			let name = components.get(path);
			if (name) { return name;}
			name = `c${components.size}`;
			components.set(path, name);
			importCodes.push(`import ${name} from ${importPathText}`)
			return name;
		}
		const code = transform(list, getComponentCode);
		await api.write('vue-router/routes.js', [
			...importCodes,
			`export default ${code}`
		].join('\n'));
	});
	await api.write('vue-router/routes.d.ts', routesType);
	await api.write('vue-router/routes.js', 'export default []');
	await api.write('vue-router/index.d.ts', indexType);
	await api.write('vue-router/index.js', createIndex(baseScript));
	api.setImport({'./vue-router': 'router'});
	api.listen('routes', true, data => {
		if (!data) { return; }
		update(data);
	})
}
router.id = 'exource/vue-router';
router.tag = 'router';
