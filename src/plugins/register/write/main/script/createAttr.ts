import { PropInfo } from '../../../mergeDefine';

export default function createAttr( name: string, p?: PropInfo, key?: string) {
	if (p?.kind === 'config' && p.locale) {
		return key ? `get ${key}() {return __locale(value.${name})}` : `__locale(value.${name})`;
	}
	if (p?.kind === 'function' && p.async) {
		return `${key ? `${key}: ` : ''}(...p) => Promise.resolve().then(() => value.${name}(...p))`;
	}
	return `${key ? `${key}: ` : ''}value.${name}`;
}
