import { Api } from 'exource';
import * as pathFn from 'node:path/posix';
import { PropInfo } from '../../../mergeDefine';

function getBaseType(
	api: Api,
	register: string,
	prop: PropInfo,
) {
	if (!prop.type) { return 'any'; }
	const {dir, name} = pathFn.parse(prop.define)
	const from = `register/${register}`;
	const to = `${dir}/${name}`;
	return `import(${JSON.stringify(api.relativePath(from, to, true))}).${prop.type}`;
}
export default function getType(
	api: Api,
	register: string,
	prop?: PropInfo,
) {
	if (!prop) { return 'any'; }
	const type = getBaseType(api, register, prop);
	if (prop.kind === 'config' && prop.locale) { return `__locale<${type}>`; };
	return type;
}
