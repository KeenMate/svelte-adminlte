//
// export function intoTree(items) {
// 	const nodePaths = items.map(x => x.nodePath)
//
// }
//
export function getParentNodePath(nodePath) {
	return nodePath.substring(0, nodePath.lastIndexOf("."));
}

export function hasChildren(tree, nodePath) {
	return tree.find((x) => getParentNodePath(x.nodePath) === nodePath);
}

export function findNestedLtreePath(tree, nodePath) {
	if (!nodePath) return [];

	const parents = getLtreeParents(nodePath);

	return tree.filter((x) => parents.includes(x.nodePath));
}

export function getLtreeParents(nodePath, acc = []) {
	const parentNodePath = getParentNodePath(nodePath);

	return (
		(!parentNodePath && acc) ||
		getLtreeParents(parentNodePath, [parentNodePath, ...acc])
	);
}

export function nodePathIsChild(nodePath) {
	return !nodePath || !!(nodePath.match(/\./g) || []).length;
}

export function getParentChildrenTree(tree, parentId, isChild, getParentId) {
	return (tree || []).filter((x) =>
		!parentId ? !isChild(x) : getParentId(x) === parentId
	);
}

export function allCHildren(tree, parentId, isChild) {
	let children;
	children = tree.filter(x => {
		if (!parentId) {
			//top level 
			return !isChild(x);
		} else {
			return x.nodePath.startsWith(parentId.toString());
		}
	});
	console.log(children);
	return children;
}
//--------------
//selection
//--------------


export function ChangeSelection(recursively, tree, nodePath, selectedProperty) {
	if (!recursively) {
		//non recursively

		return addOrRemoveSelection(tree, nodePath, selectedProperty)

	} else {
		//recursively

		//only allow selection if it doesnt have any children
		if (!hasChildren(tree, nodePath)) {

			return addOrRemoveSelection(tree, nodePath, selectedProperty)
		} else {
			//change state of all children and recompute visualstate

		}


		return tree

	}
}

function addOrRemoveSelection(tree, nodePath, selectedProperty) {
	return tree.map((x) => {
		let t = x
		if (x.nodePath == nodePath) {
			t[selectedProperty] = !x[selectedProperty]
		}
		return t;
	})

}

export function changeExpansion(tree, nodePath, expandedProperty) {
	return tree.map((x) => {
		let t = x
		if (x.nodePath == nodePath) {
			console.log(nodePath)
			t[expandedProperty] = !x[expandedProperty]
		}
		return t;
	})

}
export function ChangeSelectForAllChildren(tree, parentId, isChild, selectedProperty, changeTo) {
	tree = tree.map(x => {
		if (!parentId) {
			//top level 
			if (!isChild(x)) {
				x = changeSelectedIfNParent(x, isChild, selectedProperty, changeTo);
			}
		} else {
			if (x.nodePath.startsWith(parentId.toString()) && x.nodePath != parentId.toString()) {

				x = changeSelectedIfNParent(x, isChild, selectedProperty, changeTo);
			}
		}
		return x;
	});
	return tree;
}

//changes selectedproperty or visual state depending on 
function changeSelectedIfNParent(node, isChild, selectedProperty, changeTo) {
	if (isChild(node.nodePath)) {
		node[selectedProperty] = changeTo;
	}
	return node;
}

export function getVisualState(tree, node, isCHild, getParentId, selectedProperty) {
	let children = getParentChildrenTree(tree, nodePath, isCHild, getParentId)
	//if every child is selected or vs=true return true
	if (children.every(x => {
		if (x.hasChildren) {
			return x.__visual_state === "true"
		} else {
			return x[selectedProperty]
		}
	})) {
		return "true"
	} else
		//not every child but at least one return indeterminate 
		if (children.some(x => {
			if (x.hasChildren) {
				return x.__visual_state === "true" || x.__visual_state === "indeterminate"
			} else {
				return x[selectedProperty]
			}
		})) {
			return "indeterminate"
		}
		else {
			return "false"
		}

}

//selects all children
 