
import type { Api } from 'exource';
import { ignoreFn } from 'exource'
import { Route } from '../routes-config/types';
import transform from './transform';
import { ComponentPropConfig } from './types';


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
function createComponentImporter(api: Api, importCodes: string[]) {
	const components= new Map<string, string>();
	return function importComponent(path: string) {
		const importPath = path[0] === '.' ? api.relativePath('vue-router', path, true) : path;
		const importPathText = JSON.stringify(importPath);
		let name = components.get(path);
		if (name) { return name;}
		name = `c${components.size}`;
		components.set(path, name);
		importCodes.push(`import ${name} from ${importPathText}`);
		return name;
	}
}
export default function router(api: Api, 
	props: Record<string, boolean | ComponentPropConfig>,
	lazy?: boolean,
	allMatchPath?: string,
) {
	const update = ignoreFn(async (list: Route[]) => {
		const matchPath = allMatchPath || getDefaultPath(await api.getVersion('vue-router'))
		const isVue3 = parseInt(String(await api.getVersion('vue'))) === 3;
		const importCodes: string[] = [];
		if (isVue3) { importCodes.push(`import { defineAsyncComponent } from 'vue'`); }
		importCodes.push(`import { RouterView } from 'vue-router';`)
		const importComponent = createComponentImporter(api, importCodes);
		function getProps({
			delay, timeout, errorComponent, loadingComponent,
		}: ComponentPropConfig) {
			return [
				delay && `delay: ${JSON.stringify(delay)},`,
				timeout && `timeout: ${JSON.stringify(timeout)},`,
				errorComponent && `${isVue3 ? 'errorComponent' : 'error'}: ${importComponent(errorComponent)},`,
				loadingComponent && `${isVue3 ? 'loadingComponent' : 'loading'}: ${importComponent(loadingComponent)},`,
			].filter(Boolean).join('');
		}
		function getPropsComponent(path: string, prop: ComponentPropConfig | boolean) {
			if (!prop) { return importComponent(path); }
			const script = `() => import(${JSON.stringify(path[0] === '.' ? api.relativePath('vue-router', path, true) : path)})`;
			if (prop === true) {
				return isVue3 ? `defineAsyncComponent(${script})` : script;
			}
			if (isVue3) {
				return `defineAsyncComponent({loader: ${script}, ${getProps(prop)}})`
			}
			return `{component: ${script}, ${getProps(prop)}}`
		}
		function getComponentCode(path: string) {
			if (!lazy) { return importComponent(path); }
			return `() => import(${JSON.stringify(path[0] === '.' ? api.relativePath('vue-router', path, true) : path)})`;
		}
		const code = transform(list, getComponentCode, getPropsComponent, matchPath, props);
		await api.write('vue-router/routes.js', [
			...importCodes,
			createRedirect,
			`export default ${code}`
		].join('\n'));
	});
	api.listen('routes', true, data => {
		if (!data) { return; }
		update(data);
	})
}
router.id = 'exource/vue-router';
router.tag = 'router';
