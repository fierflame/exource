
import type { Api } from 'exource';
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
	base,
	baseScript,
}: {
	lazy?: boolean;
	base?: string;
	baseScript?: string;
	componentProps?: string | string[];
	allMatchPath?: string;

	delay?: number,
	timeout?: number,
	errorComponent?: string;
	loadingComponent?: string;
}) {
	if (base) { baseScript = JSON.stringify(base); }
	await api.write('vue-router/index.d.ts', indexType);
	await api.write('vue-router/index.js', createIndex(baseScript));
}
router.id = 'exource/vue-router';
router.tag = 'router';
