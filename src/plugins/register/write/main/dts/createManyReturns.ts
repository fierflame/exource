import { Api } from 'exource';
import { PropInfo } from '../../../mergeDefine';
import getType from './getType';

export default function createManyReturns(
	api: Api,
	register: string,
	name: string,
	returns: Record<string, string>,
	props: Record<string, PropInfo>,
): string {
	Object.values(returns)

	return `
declare interface ${name} {
	${Object.entries(returns).map(([n, p]) => `${n}: ${getType(api, register, props[p])};`).join('\n\t')}
}
declare function ${name}(key: string): ${name} | undefined;
declare function ${name}(key?: undefined): Record<string, ${name}>;
declare function ${name}(key?: string): ${name} | undefined | Record<string, ${name}>;
`
}
