export default function getComponentProps(v: any): Set<string> {
	if (v && typeof v === 'string') { return new Set([v]); }
	if (Array.isArray(v)) {
		return new Set(v.filter(v => v && typeof v === 'string'));
	}
	return new Set();
}
