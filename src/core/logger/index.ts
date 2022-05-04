import kleur from 'kleur';

function getTag(pluginId: string, tag: string) {
	if (pluginId && tag) {
		return `[${pluginId}:${tag}] `
	}
	if (pluginId) {
		return `[${pluginId}] `
	}
	if (tag) {
		return `[:${tag}] `
	}
	return '';
}

export default function logger(level: -1 | 0 | 1 | 2, plugin: string, tag: string, text: string) {
	const date = new Date();
	const time = `${[date.getHours(), date.getMinutes(), date.getSeconds()]
		.map(v => `${v}`.padStart(2,'0')).join(':')}.${`${date.getMilliseconds()}`.padStart(3,'0')}`
	const head = kleur.dim(`${time} ${getTag(plugin, tag)}`)
	const log = !level ? console.info
		: level < 0 ? console.debug
		: level === 1 ? console.warn
		: console.error;
	for (const line of text.split('\n')) {
		const texts = [head];
		if (!level){
			texts.push(line);
		} else if (level < 0) {
			texts.push(kleur.dim(line));
		} else if (level === 1) {
			texts.push(kleur.red(line));
		} else {
			texts.push(kleur.red().bold(line));
		}
		log(texts.join(''))
	}
}
