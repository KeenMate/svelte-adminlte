//
// export function intoTree(items) {
// 	const nodePaths = items.map(x => x.nodePath)
//
// }
//
export function getParentNodePath(nodePath) {
	return nodePath.substring(0, nodePath.lastIndexOf("."))
}

export function hasChildren(tree, nodePath) {
	return tree.find(x => getParentNodePath(x) === nodePath)
}

export function findNestedLtreePath(tree, nodePath) {
	if (!nodePath)
		return []

	const parents = getLtreeParents(nodePath)

	return tree.filter(x => parents.includes(x.nodePath))
}

export function getLtreeParents(nodePath, acc = []) {
	const parentNodePath = getParentNodePath(nodePath)

	return !parentNodePath
		&& acc
		|| getLtreeParents(parentNodePath, [parentNodePath, ...acc])
}

export function nodePathIsChild(nodePath) {
	return !nodePath || !!(nodePath.match(/\./g) || []).length
}
