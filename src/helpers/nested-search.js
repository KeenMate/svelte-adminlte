export function filterNested(tree, predicate, acc = []) {
	for (let i = 0; i < tree.length; i++) {
		if (predicate(tree[i]))
			acc.push(tree[i])

		const children = tree[i].children
		if (children && children.length) {
			acc = filterNested(children, predicate, acc)
		}
	}

	return acc
}

export function findNested(tree, predicate) {
	try {
		filterNested(tree, x => {
			if (predicate(x))
				throw x
		})
	} catch (found) {
		return found
	}
}

function findNestedPathInner(tree, predicate, acc) {
	for (let i = 0; i < tree.length; i++) {
		const newAcc = [...acc, tree[i]]

		if (predicate(tree[i]))
			throw newAcc

		const children = tree[i].children
		if (children && children.length) {
			findNestedPathInner(children, predicate, newAcc)
		}
	}
}

export function findNestedPath(tree, predicate) {
	try {
		findNestedPathInner(tree, predicate, [])
	} catch (result) {
		if (result instanceof Error)
			throw result

		return result
	}
}
