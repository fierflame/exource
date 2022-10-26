import { Api, ignoreMapFn } from 'exource';

const type = `\
declare const value: Record<string, any>;
export default value;
`

function getName(path: string) {
	const paths = path.split(/\/locales\//);
	if (path.length < 2) { return; }
	const p = (paths.pop() || '').replace(/\.(json5?|ya?ml)$/, '').split('/');
	const r = regex.exec(p[0]) ||regex.exec(p[p.length - 1]);
	if (!r) { return; }
	const name = r[2] ? `${r[1]}-${r[2]}` : r[1];
	return name;
}

const regex = /^([a-z]{2})(?:[-_]?([A-Z]{2,3}))?$/;
export default async function locale(api: Api, {
}: {
}) {
	const filepath = `{${api.moduleDir}/*,${api.root}}/locales/{*,**/*}`;
	const files = new Map<string, Map<string, any>>();
	const locales = new Set<string>();
	function emit() {
		api.emit('files:locales', Object.fromEntries([...locales].map(l => [l, `locales/${l}`])));
	}
	const updateLocale = ignoreMapFn(async (name: string) => {
		const map = files.get(name);
		if (!map) {
			if (!locales.delete(name)) { return; }
			await api.remove(`locales/${name}.js`);
			await api.remove(`locales/${name}.d.ts`);
			emit();
			return;
		}
		const values = {};
		const paths = new Map<string, Set<string>>();
		for (const [path, locale] of map) {
			for (const [k,v] of Object.entries(locale)) {
				values[k] = v;
				const m = paths.get(k);
				if (!m){
					paths.set(k, new Set([path]));
				} else {
					m.add(path);
				}
			}
		}
		for (const [key, set] of paths) {
			if (set.size > 1) {
				api.logger.tag('define').warn([`'${key}' 被多次定义:`, ...set].join('\n    '));
			}
		}
		await api.write(`locales/${name}.js`, `export default ${JSON.stringify(values)}`);
		await api.write(`locales/${name}.d.ts`, type);
		if (locales.has(name)) { return; }
		locales.add(name);
		emit();
	})

	function addLocale(path: string, locale: object) {
		const name = getName(path);
		if (!name) { return; }
		let map = files.get(name);
		if (!map) {
			map = new Map();
			files.set(name, map);
		}
		map.set(path, locale);
		return name;
	}
	function removeLocale(path: string) {
		const name = getName(path);
		if (!name) { return; }
		const map = files.get(name);
		if (!map) { return; }
		if (!map.delete(path)) { return; }
		return name
	}
	api.scanCfg(filepath, (path, locale) => {
		const is = locale && !Array.isArray(locale) && typeof locale === 'object'
		const name = is ? addLocale(path, locale) : removeLocale(path)
		if (name) { updateLocale(name); }
	}, (locales) => {
		for (const [path, locale] of Object.entries(locales)) {
			if (locale && !Array.isArray(locale) && typeof locale === 'object') {
				addLocale(path, locale);
			}
		}
		for (const name of files.keys()) {
			updateLocale(name);
		}
	})
}
locale.id = 'exource/locales';
locale.tag = 'locales';
