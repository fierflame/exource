import write from './write';

export default async function writeIndex(
	outputRoot: string,
	imports: Record<string | symbol, Record<string, boolean | string>>
) {
	const lines: string[] = [];
	for (const key of Reflect.ownKeys(imports)) {
		for (const [p, v] of Object.entries(imports[key])) {
			if (typeof v === 'string') {
				lines.push(`export { default as ${v} } from '${p}';`);
			} else if (v) {
				lines.push(`export * from '${p}';`);
			} else {
				lines.push(`import '${p}';`);
			}
		}
	}
	const script = lines.join('\n')
	await write(outputRoot, 'exource', 'index.js', script);
	await write(outputRoot, 'exource', 'index.d.ts', script);

}
