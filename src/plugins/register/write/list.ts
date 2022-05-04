import { Api } from 'exource';

export default async function writeList(
	api: Api,
	register: string,
	items: Set<string>
) {
	const list = [...items];
	
	const script = [
		...list.map(key => `import * as ${key} from './items/${key}';`),
		'export {',
		...list.map(key => `\t${key},`),
		'}',
	].join('\n');
	const types = list.map(key => `export * as ${key} from './items/${key}';`).join('\n')
	api.write(`registers/${register}/list.js`, script)
	api.write(`registers/${register}/list.d.ts`, types)
}
