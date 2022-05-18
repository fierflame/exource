import { ComponentPropConfig } from './types';

function getNumber(v: any) {
	return Number.isFinite(v) && v > 0 ? v : 0;
}
function getComponent(v: any) {
	return typeof v === 'string' ? v : '';
}
function getCfg(p: any, lazy?: boolean): ComponentPropConfig | boolean {
	if (typeof p === 'boolean') { return p; }
	if (!p || typeof p !== 'object') { return lazy ? {} : false; }
	let {delay, timeout, errorComponent, loadingComponent} = p;
	return {
		delay: getNumber(delay),
		timeout: getNumber(timeout),
		errorComponent: getComponent(errorComponent),
		loadingComponent: getComponent(loadingComponent),
	}
}
export default function getComponentProps(
	def: ComponentPropConfig,
	p?: string | string[] | Record<string, ComponentPropConfig | boolean>,
	lazy?: boolean
) {
	const props: Record<string, ComponentPropConfig | boolean> = Object.create(null);
	if (!p) { return props; }
	if (typeof p === 'string') {
		props[p] = getCfg(def, lazy);
	}
	if (typeof p !== 'object') { return props; }
	if (Array.isArray(p)) {
		for (const k of p) {
			props[k] = getCfg(def, lazy);
		}
	} else {
		for (const [k, v] of Object.entries(p)) {
			props[k] = getCfg(v, lazy);
		}
	}
	return props;
}
