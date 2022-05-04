import { Api } from 'exource';
import { PropInfo } from '../../../mergeDefine';
import getType from './getType';



export default function createGet(
	api: Api,
	register: string,
	name: string,
	prop?: PropInfo,
) {
	return `
declare type ${name} = ${getType(api, register, prop)}
declare function ${name}(key?: undefined): Record<string, ${name}>;
declare function ${name}(key: string): ${name} | undefined;
declare function ${name}(key?: string): ${name} | undefined | Record<string, ${name}>;
`

}
