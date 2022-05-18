
import type { Api } from 'exource';
import { ignoreFn } from 'exource'

export interface Options {
	base?: string;
	baseScript?: string;
}



const indexType = `\
import { Router } from 'vue-router';
declare const router: Router;
export default router;
`

function createIndex(baseScript?: string, path?: string) {
	return `\
import {createRouter, createWebHistory } from 'vue-router';
${path ? `import routes from './routes';` : ''}

const router = createRouter({
	history: createWebHistory(${baseScript || ''}),
	${path ? `routes` : 'routes: []'},
})
export default router;
`;
}

export default async function router(api: Api, {
	base, baseScript,
}: Options) {
	if (base) { baseScript = JSON.stringify(base); }
	await api.write('vue/router.d.ts', indexType);
	await api.write('vue/router.js', createIndex(baseScript));
	api.setImport({'./vue/router': 'vueRouter'});
	api.listen<string>('file:vue/routes', true, ignoreFn(path => {
		const routesPath = path ? api.relativePath('./vue', path) : undefined;
		return api.write('vue/router.js', createIndex(baseScript, routesPath));
	}));
}
router.id = 'exource/vue-router';
router.tag = 'router';
