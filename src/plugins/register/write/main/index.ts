import { Api } from 'exource';
import { RegisterInfo } from '../../mergeDefine';
import dts from './dts';
import script from './script';

export default async function(api: Api, register: string, info: RegisterInfo) {
	await api.write(`registers/${register}/index.js`, script(info));
	await api.write(`registers/${register}/index.d.ts`, dts(api, register, info));
}
