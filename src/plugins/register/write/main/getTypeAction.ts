import { PropInfo } from '../../mergeDefine';


export default function getTypeAction(
	action?: "get" | "exec",
	prop?: PropInfo,
): 'get' | 'exec' {
	if (!prop) { return 'get' }
	if (prop.kind === 'function') {
		if (action === 'exec') { return 'exec'}
		return 'get';
	}
	// if (prop.kind === 'component') {
	// 	if (action === 'render') { return 'component'}
	// 	return 'get';
	// }
	// if (prop.kind === 'vue3') {
	// 	if (action === 'render') { return 'vue3'}
	// 	return 'get';
	// }
	// if (prop.kind === 'react') {
	// 	if (action === 'render') { return 'react'}
	// 	return 'get';
	// }
	return 'get';
}
