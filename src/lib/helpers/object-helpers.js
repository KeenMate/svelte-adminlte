export function getKeysByPrefix(object, prefix) {
	return Object.keys(object)
		.filter(x => x.startsWith(prefix))
		.reduce((acc, x) => (acc[x.substring(prefix.length)] = object[x], acc))
}
