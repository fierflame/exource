import { PropInfo } from '../../../mergeDefine';
import { MethodExportDefine } from '../../../types';
import getTypeAction from '../getTypeAction';
import createAttr from './createAttr';




function get(
	returns: string,
	prop?: PropInfo,
): [string, string] {
	return [
		`return ${ createAttr(returns, prop) };`,
		`res[key] = ${ createAttr(returns, prop) };`,
	];

}

function exec(
	returns: string,
	prop?: PropInfo,
): [string, string] {
	const async = prop?.kind === 'function' && prop.async;
	return [
		`return ${async ? `Promise.resolve().then(() => value.${returns}(...p))` : `value.${returns}(...p)`};`,
		`res[key] =  ${async ? `(...p) => Promise.resolve().then(() => value.${returns}(...p))` : `value.${returns}` };`,
	];
}
function many(
	returns: Record<string, string>,
	props: Record<string, PropInfo>,
): [string, string] {
	const getObj = `const obj = {
			${Object.entries(returns).map(([n, p]) => `${createAttr(p, props[p], n)},`).join('\n\t\t\t')}
		};`;
		return [`${getObj}\n\t\treturn obj;`, `${getObj}\n\t\tres[key] = obj;`]
}


function getReturnMap(returns: string[] | Record<string, string>) {
	if (!Array.isArray(returns)) { return returns; }
	const res: Record<string, string> = {}
	for (const k of returns) {
		res[k] = k;
	}
	return res;
}

function getReturn(
	exp: MethodExportDefine,
	props: Record<string, PropInfo>,
): [string, string] {
	const returns = exp.return;
	if (typeof returns !== 'string') {
		return many(getReturnMap(returns), props);
	}
	const prop = props[returns]
	let action = getTypeAction(exp.action, prop);
	if (action === 'get') {
		return get(returns, prop)
	}
	return exec(returns, prop)

}

export default function createExport(
	name: string,
	exp: MethodExportDefine,
	props: Record<string, PropInfo>,
): string {
	const [one, all] = getReturn(exp, props)
	let includes = exp.includes;
	if (typeof includes=== 'string') { includes = [includes]}
	includes = includes?.length ? JSON.stringify(includes) : '';
	return `
export ${name === 'default' ? name : ''} function ${name === 'default' ? '' : name}(key, ...p) {
	if (typeof key === 'string') {
		if (!(key in __items)) { return }
		const value = __items[key];
		${includes ? `if (!__filter(value, ${includes})) { return; }` : ''}
		${one}
	}
	const res = {};
	for (const [key, value] of Object.entries(__items)) {
		${includes ? `if (!__filter(value, ${includes})) { continue; }` : ''}
		${all}
	}
	return res;
}
`

}
