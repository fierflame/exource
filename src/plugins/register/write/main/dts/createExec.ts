import { Api } from 'exource';
import { PropInfo } from '../../../mergeDefine';
import getType from './getType';

export default function createExec(
	api: Api,
	register: string,
	name: string,
	prop?: PropInfo,
) {
	return `
declare type ${name} = ${getType(api, register, prop)}
declare function ${name}(key?: undefined): Record<string, ${name}>;
declare function ${name}(key: string, ...p: Parameters<${name}>): ReturnType<${name}> | undefined;
declare function ${name}(key?: string, ...p: Parameters<${name}> | []): ReturnType<${name}> | undefined | Record<string, ${name}>;
`
}
