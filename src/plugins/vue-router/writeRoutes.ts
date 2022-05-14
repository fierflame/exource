
import type { Api } from 'exource';
import { ignoreFn } from 'exource'
import { Route } from '../routes-config/types';
import getComponentProps from './getComponentProps';
import transform from './transform';
const routesType = `\
import { RouteRecordRaw } from 'vue-router';
declare const T: RouteRecordRaw[];
export default T;
`


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
	componentProps,
	allMatchPath,
	delay, timeout, errorComponent, loadingComponent,
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
	const update = ignoreFn(async (list: Route[]) => {
		const components= new Map<string, string>();
		const matchPath = allMatchPath || getDefaultPath(await api.getVersion('vue-router'))
		const isVue3 = parseInt(String(await api.getVersion('vue'))) === 3;
		const importCodes: string[] = [];
		if (isVue3) { importCodes.push(`import { defineAsyncComponent } from 'vue'`); }
		importCodes.push(`import { RouterView } from 'vue-router';`)
		const customizeLazyOptions = [
			delay ? `delay: ${JSON.stringify(delay)},` : '',
			timeout ? `timeout: ${JSON.stringify(timeout)},` : '',
		];
		if (errorComponent) {
			const importPath = errorComponent[0] === '.' ? api.relativePath('vue-router', errorComponent, true) : errorComponent;
			importCodes.push(`import ErrorComponent from ${JSON.stringify(importPath)}`)
			customizeLazyOptions.push(`${isVue3 ? 'errorComponent' : 'error'}: ErrorComponent,`)
		}
		if (loadingComponent) {
			const importPath = loadingComponent[0] === '.' ? api.relativePath('vue-router', loadingComponent, true) : loadingComponent;
			importCodes.push(`import LoadingComponent from ${JSON.stringify(importPath)}`)
			customizeLazyOptions.push(`${isVue3 ? 'loadingComponent' : 'loading'}: LoadingComponent,`)
		}
		const customizeLazyOptionsScripts = customizeLazyOptions.filter(Boolean).join('');
		function getComponentCode(path: string, isCustomize?: boolean) {
			const importPath = path[0] === '.' ? api.relativePath('vue-router', path, true) : path;
			const importPathText = JSON.stringify(importPath);
			if (lazy) {
				const script = `() => import(${importPathText})`;
				if (!isCustomize) { return script; }
				if (isVue3) {
					return `defineAsyncComponent({loader: ${script}, ${customizeLazyOptionsScripts}})`
				}
				return `{component: ${script}, ${customizeLazyOptionsScripts}}`
			}
			let name = components.get(path);
			if (name) { return name;}
			name = `c${components.size}`;
			components.set(path, name);
			importCodes.push(`import ${name} from ${importPathText}`)
			return name;
		}
		const code = transform(list, getComponentCode, matchPath, getComponentProps(componentProps));
		await api.write('vue-router/routes.js', [
			...importCodes,
			createRedirect,
			`export default ${code}`
		].join('\n'));
	});
	await api.write('vue-router/routes.d.ts', routesType);
	await api.write('vue-router/routes.js', 'export default []');
	api.listen('routes', true, data => {
		if (!data) { return; }
		update(data);
	})
}
router.id = 'exource/vue-router';
router.tag = 'router';
