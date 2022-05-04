import { logger } from 'exource';
import glob from 'fast-glob';
import * as fsPromises from 'node:fs/promises';
const paths = [
	`exource.config.js`,
	`exource.config.mjs`,
	`exource.config.yml`,
	`exource.config.yaml`,
	`exource.config.json`,
	`config/exource.js`,
	`config/exource.mjs`,
	`config/exource.yml`,
	`config/exource.yaml`,
	`config/exource.json`,
]
const defaultScript = `\
/** @type {import("exource").Config} */
const config = {
	cwd: '',
	root: 'src',
	moduleDir: 'modules',
	output: 'src/_exource',
	plugins: [
		/** ... */
	]
};
export default config;
`
export default async function init() {

	for (const path of paths) {
		const [p] = await glob( path)
		if (p) {
			logger(2, 'exource', 'init', `配置文件已存在：${p}`);
			return;
		}
	}
	try {
		const s = await fsPromises.readFile('package.json', 'utf-8')
		const t = JSON.parse(s);
		if (t && 'exource' in t) {
			logger(2, 'exource', 'init', `配置文件已存在于 package.json 中`);
			return;
		}
	} catch {
		
	}
	try {
		await fsPromises.writeFile('exource.config.mjs', defaultScript)
		logger(0, 'exource', 'init', `配置文件 exource.config.mjs 已创建`);
	} catch(e) {
		logger(2, 'exource', 'init', `配置文件创建失败`);
	}
}
