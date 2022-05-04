export default function getMap<K, V>(map:Map<K,V>, key: K, create: () => V): V {
	const value  = map.get(key);
	if (value) { return value; }
	const n = create();
	map.set(key, n);
	return n;
}
