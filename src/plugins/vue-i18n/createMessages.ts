export default function(
	v: Record<string, string>,
	languages?:string[],
) {
	if (!Array.isArray(languages)) {
		languages = [];
	} else {
		languages = languages.filter(l => l && typeof l === 'string')
	}
	const langs = languages.length ? new Set(languages) : undefined;
	const imports: string[] = [];
	const script = [];
	for (const [k, file] of Object.entries(v)) {
		if (langs && !langs.has(k)) { continue; }
		const n = `l${imports.length}`;
		imports.push(`import ${n} from ${JSON.stringify(`../../${file}`)};`)
		script.push(`	${JSON.stringify(k)}: {message: ${n}},`);
	}
	return [
		...imports, 
		`export default {`,
		...script,
		`};`
	].join('\n');
}
