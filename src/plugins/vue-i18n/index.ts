import type { Api } from 'exource';
import createMain from './createMain';


const indexType = `\
import { I18n } from 'vue-i18n'
declare const exports: I18n<unknown, unknown, unknown, false>
export default exports
`


const localeGetterScript = `\
import i18n from './index';
export default () => i18n.global.locale.value;
`
const localeGetterType = `\
export default function(): string;
`
export default async function vueI18n(api: Api, {
	languages,
	storageKey,
}:{
	languages?:string[],
	storageKey?: string;
}) {
	await api.write('vue-i18n/index.js', createMain(storageKey, languages));
	await api.write('vue-i18n/index.d.ts', indexType);
	await api.write('vue-i18n/localeGetter.js', localeGetterScript);
	await api.write('vue-i18n/localeGetter.d.ts', localeGetterType);
	api.emit('localeGetter', 'vue-i18n/localeGetter');
	api.setImport({'./vue-i18n': 'vueI18n'});
}
vueI18n.id = 'exource/vue-i18n';
vueI18n.tag = 'i18n';
