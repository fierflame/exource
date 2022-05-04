export default function getRegisterName(path: string) {
	const filename = path.split('/').pop();
	if (!filename) { return ''; }
	return filename.replace(/\.(json5?|yml)$/, '');
}
