import { Api } from 'exource';

const unLocaleType = `\
declare function locale(p: any): any;
declare type locale<T> = T;
export default locale;
`;
const type = `\
declare function locale(p: any): string;
declare type locale<T> = string;
export default locale;
`

const unLocaleScript = `\
export default function(p) { return p; }
`;

function get(file: string) {
	return `\
import getLocale from '../${file}'
export default function (p) {
	if (!p) { return ''; }
	if (typeof p === 'string') { return p; }
	let def = String(p);
	if (Array.isArray(p)) { [def, p] = p; }
	if (!p) { return def; }
	if (typeof p !== 'object') { return def; }
	const l = getLocale();
	let [lang, zone] = getLocale().replace(/-/g, '_').split('_');
	lang = lang.toLowerCase();
	if (zone) {
		zone = zone.toUpperCase()
		const l1 = [lang, zone].join('_');
		if (l1 in p) { return String(p[l1]); }
		const l2 = [lang, zone].join('-');
		if (l2 in p) { return String(p[l2]); }
		const l3 = [lang, zone].join('');
		if (l3 in p) { return String(p[l3]); }
	}
	if (lang in p) { return String(p[lang]); }
	return def;
}
`;
}


export default async function writeLocale(api: Api, file?: string) {
	await api.write(`registers/__locale.js`, file ? get(file) : unLocaleScript);
	await api.write(`registers/__locale.d.ts`, file ? type : unLocaleType);
}
