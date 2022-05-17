export default function initDataChannel() {
	const data = new Map<string | symbol, Map<string | symbol, any>>();
	const listeners: Record<string | symbol, Set<(...data: any[]) => any>> = Object.create(null);
	function getDataMap(name: string | symbol) {
		let map = data.get(name);
		if (map) { return map; }
		map = new Map();
		data.set(name, map)
		return map;
	}

	function emitToListen(name: string | symbol) {
		const set = listeners[name];
		if (!set) { return; }
		const map = data.get(name);
		const value = map ? [...map.values()] : [];
		for (const l of set) {
			l(...value);
		}
	}

	function emit(pluginId: string | symbol, name: string | symbol, value: any) {
		if (value === undefined) {
			let map = data.get(name);
			if (!map?.has(pluginId)) { return; }
			map.delete(pluginId);
			if (!map.size) { data.delete(name); }
		} else {
			const map = getDataMap(name);
			map.set(pluginId, value);
		}
		emitToListen(name);
	}
	function get(name: string) {
		const map = data.get(name);
		const value = map ? [...map.values()] : [];
		return value;
	}
	function listen(name: string, get: true, listener: (...data: any[]) => any): () => void
	function listen(name: string, listener: (...data: any[]) => any): () => void
	function listen(name: string, get: ((...data: any[]) => any) | true, listener?: (...data: any[]) => any): () => void {
		const f = [get, listener].find(t => typeof t === 'function') as ((...data: any[]) => any | undefined);
		if (!f) { return () => {}; }
		function fn(...v: any[]) { f(...v) }
		let set = listeners[name];
		if (!set) {set = new Set(); listeners[name] = set; }
		set.add(fn);
		if (get === true) {
			const map = data.get(name);
			if (map) {
				fn(...map.values())
			} else {
				fn();
			}
		}
		return () => { set.delete(fn); }
	}
	return {emit, get, listen};
}
