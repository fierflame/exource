const regex = /^config.(ya?ml|json5?)$/
export default function getRegisterKey(path: string): void | [string, string] {
	const filenames = path.replace(/\.(?:jsx?|tsx?|vue)$/, '')
	.replace(/\/index$/, '')
	.split('/')
	const filename = filenames.pop();
	if (!filename) { return; }
	const key = filenames.pop();
	if (!key) { return; }
	return [key, regex.test(filename) ? '' : filename];
}
