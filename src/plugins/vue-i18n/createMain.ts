export default function(
	storageKey?: string,
	languages?:string[],
) {
	if (!storageKey || typeof storageKey !== 'string') {
		storageKey = 'locale';
	}
	if (!Array.isArray(languages)) {
		languages = [];
	} else {
		languages = languages.filter(l => l && typeof l === 'string')
	}
	return `\
import { createI18n } from 'vue-i18n';
import { watch } from 'vue';
const languages = ${JSON.stringify(languages)};
function getDefaultLocale() {
	let locale = localStorage.getItem(${JSON.stringify(storageKey)}) || navigator.language;
	if (!languages.length || languages.includes(locale)) { return locale; }
	for (const l of navigator.languages) {
		if (languages.includes(l)) {
			return l;
		}
	}
	return languages[0]
}
const i18n = createI18n({
	legacy: false,
	locale: getDefaultLocale(),
	messages: {}
})

watch(i18n.global.locale, v => {
	localStorage.setItem(${JSON.stringify(storageKey)}, v)
})
export default i18n;
`
}
