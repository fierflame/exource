import { Api } from 'exource';
import getMap from './getMap';
import { PropDefine, ExportDefine, Define } from './types';

export type PropInfo = PropDefine & Record<'define', string>
export interface RegisterInfo {
	files: Set<string>;
	props: Record<string, PropInfo>;
	exports: Record<string, ExportDefine>;

}
export default function mergeDefine(
	api: Api,
	register: string,
	defines: [string, Define][]
): RegisterInfo {
	const files = new Set<string>()
	const props: Record<string, PropInfo> = {};
	const exports: Record<string, ExportDefine> = {};
	const propsDefines = new Map<string, Set<string>>();
	const exportsDefines = new Map<string, Set<string>>();
	for (const [file, define] of defines) {
		if (!define) { continue; }
		const {props: p = {}, exports: e = {}} = define;
		for (const [name, prop] of Object.entries(p)) {
			getMap(propsDefines, name, () => new Set()).add(file);
			if (typeof prop === 'string') {
				files.add(prop === 'config' ? '' : name);
				props[name] = { kind: prop, define: file };
			} else{
				files.add(prop.kind === 'config' ? '' : name);
				props[name] = { ...prop, define: file };
			}
		}
		for (const [name, exp] of Object.entries(e)) {
			getMap(exportsDefines, name, () => new Set()).add(file);
			exports[name] = exp;
		}
	}
	api.logger.tag('define').info(`注册器 '${register}' 的定义已被更新`);
	for (const [key, set] of propsDefines) {
		if (set.size > 1) {
			api.logger.tag('define').warn([`属性 '${key}' 被多次定义:`, ...set].join('\n    '));
		}
	}
	for (const [key, set] of exportsDefines) {
		if (set.size > 1) {
			api.logger.tag('define').warn([`导出 '${key}' 被多次定义:`, ...set].join('\n    '));
		}
	}
	return {files, props, exports };
}
