import { Api } from 'exource';

const script = `\
export default function(p, includes) {
	for (const k of includes) {
		if (!(k in p)) { return false; }
	}
	return true;
}
`;
const type = `\
export default function(p: any, includes: any): boolean;
`;
export default async function writeFilter(api: Api) {
	await api.write(`registers/__filter.js`, script);
	await api.write(`registers/__filter.d.ts`, type);
}
