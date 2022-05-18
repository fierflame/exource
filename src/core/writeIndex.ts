function transImport(path?: string | string[] | Record<string, boolean | string>) {
	const paths: Record<string, boolean | string> = {};
	if (!path) { return paths; }
	if (Array.isArray(path)) {
		for (const p of path) {
			if (!p) { continue; }
			if (typeof p !== 'string') { continue; }
			paths[p] = false;
		}
		return paths;
	}
	for (const [p,v] of Object.entries(path)) {
		if (!p) { continue; }
		paths[p] = v && typeof v === 'string' || v === true ? v : false;
	}
	return paths;
}
import write from './write';

export default async function writeIndex(
	outputRoot: string,
	paths: (string | Record<string, string | boolean> | string[])[],
) {
	const lines: string[] = [];
	for (const path of paths) {
		for (const [p, v] of Object.entries(transImport(path))) {
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
