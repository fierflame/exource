import { RegisterInfo, PropInfo } from '../../../mergeDefine';
import { MethodExportDefine } from '../../../types';
import createGet from './createGet';
import createManyReturns from './createManyReturns';
import createExec from './createExec';
import getTypeAction from '../getTypeAction';
import { Api } from 'exource';




function getReturnMap(returns: string[] | Record<string, string>) {
	if (!Array.isArray(returns)) { return returns; }
	const res: Record<string, string> = {}
	for (const k of returns) {
		res[k] = k;
	}
	return res;
}

function createExport(
	api: Api,
	register: string,
	name: string,
	exp: MethodExportDefine,
	props: Record<string, PropInfo>,
): string {
	const returns = exp.return;
	if (typeof returns !== 'string') {
		return createManyReturns(api, register, name, getReturnMap(returns), props);
	}
	const prop = props[returns]
	let action = getTypeAction(exp.action, prop);
	if (action === 'get') {
		return createGet(api, register, name, prop)
	}
	return createExec(api, register, name, prop)

}



export default function dts(
	api: Api,
	register: string,
	{props, exports}: RegisterInfo) {
	const scripts: string[] = [`\
import __locale from '../__locale';
`];
	for (const [name, ex] of Object.entries(exports)) {
		const defName = name === 'default' ? '__default' : name
		scripts.push(createExport(api, register, defName, ex, props));
		scripts.push(`export {${defName} as ${name}}`);
	}
	return scripts.join('\n')
}
