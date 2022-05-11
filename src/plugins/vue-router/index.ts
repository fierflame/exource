
import type { Api } from 'exource';
import { ignoreFn } from 'exource'
import { Route } from '../routes-config/types';
import getComponentProps from './getComponentProps';
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

const createRedirect = `
function replaceParams(path, params) {
	return path.replace(/\\\\(.)|:([a-zA-Z_][a-zA-Z_0-9]*)/g, (_, s, k) => s || (k in params ? params[k] : \`:\${k}\`));
}
function createRedirect(redirect) {
	return ({ params, matched }) => {
		let path = replaceParams(redirect, params)
		for (let i = matched.length - 2; path[0] !== '/' && i >= 0; i--) {
			let mp = matched[i]?.path;
			if (!mp || mp === '*') { continue; }
			const pp = replaceParams(mp, params)
			if (!pp) { continue; }
			path = path ? \`\${pp}/\${path}\` : pp;
		}
		path = \`/\${path}\`.replace(/\\/(\\.?\\/)+/g, '/');
		for(;;) {
			const newPath = path.replace(/\\/[^.][^/]*\\/\\.\\.(?=\\/|\$)/g, '').replace(/^\\/(\\.\\.\\/)+/g, '/');
			if (newPath === path) { return path;}
			path = newPath
		};
	};
}
`

function getDefaultPath(version: string): string {
	return parseInt(String(version)) < 4 ? '*' : '/:_(.*)';
}
export default async function router(api: Api, {
	lazy,
	base,
	baseScript,
	componentProps,
	allMatchPath,
}: {
	lazy?: boolean;
	base?: string;
	baseScript?: string;
	componentProps?: string | string[];
	allMatchPath?: string;
}) {
	if (base) { baseScript = JSON.stringify(base); }
	const update = ignoreFn(async (list: Route[]) => {
		const components= new Map<string, string>();
		const matchPath = allMatchPath || getDefaultPath(await api.getVersion('vue-router'))
		const importCodes: string[] = ["import { defineAsyncComponent } from 'vue'"];
		function getComponentCode(path: string) {
			const importPath = path[0] === '.' ? api.relativePath('vue-router', path, true) : path;
			const importPathText = JSON.stringify(importPath);
			if (lazy) { return `() => import(${importPathText})`}
			let name = components.get(path);
			if (name) { return name;}
			name = `c${components.size}`;
			components.set(path, name);
			importCodes.push(`import ${name} from ${importPathText}`)
			return name;
		}
		const code = transform(list, getComponentCode, matchPath, getComponentProps(componentProps));
		await api.write('vue-router/routes.js', [
			`import { RouterView } from 'vue-router';`,
			...importCodes,
			createRedirect,
			`export default ${code}`
		].join('\n'));
	});
	await api.write('vue-router/routes.d.ts', routesType);
	await api.write('vue-router/routes.js', 'export default []');
	await api.write('vue-router/index.d.ts', indexType);
	await api.write('vue-router/index.js', createIndex(baseScript));
	api.setImport({'./vue-router': 'vueRouter'});
	api.listen('routes', true, data => {
		if (!data) { return; }
		update(data);
	})
}
router.id = 'exource/vue-router';
router.tag = 'router';
