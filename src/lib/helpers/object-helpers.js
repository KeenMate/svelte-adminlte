/**
 * @param object {object} expects keys to be lowerCamelCase
 * @param prefix {string} prefix to search by
 * @returns {object} new object with filtered keys
 */
export function getKeysByPrefix(object, prefix) {
	return Object.keys(object)
		.filter(x => x.startsWith(prefix))
		.reduce((acc, x) => (acc[extractPrefix(x, prefix)] = object[x], acc), {})
}

function extractPrefix(field, prefix) {
	return field.substring(prefix.length).replace(/^\w/, x => x.toLocaleLowerCase())
}
