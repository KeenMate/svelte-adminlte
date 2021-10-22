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


export function ChangeSelection(recursively, tree, nodePath,isChild,getParentId, selectedProperty) {
	if (!recursively) {
		//non recursively

		return addOrRemoveSelection(tree, nodePath, selectedProperty)

	} else {
		//recursively

		//only allow selection if it doesnt have any children
		tree =  addOrRemoveSelection(tree, nodePath, selectedProperty)
		if(tree == null){
			console.log("NULLL")
			console.log(tree)
		}
		return recomputeAllParentVisualState(tree,nodePath,isChild,getParentId,selectedProperty)


	}
}

function addOrRemoveSelection(tree, nodePath, selectedProperty) {
	return tree.map((x) => {
		let t = x
		if (x.nodePath == nodePath) {
			t[selectedProperty] = !x[selectedProperty]
			t.__visual_state = !x[selectedProperty]
		}
		return t;
	})

}

export function changeExpansion(tree, nodePath, expandedProperty) {
	return tree.map((x) => {
		let t = x
		if (x.nodePath == nodePath) {
			
			t[expandedProperty] = !x[expandedProperty]
		}
		return t;
	})

}

export function ChangeSelectForAllChildren(tree, parentId, isChild, selectedProperty, changeTo) {
	tree = tree.map(x => {
		//changes itself
		if(parentId == x.nodePath){
			x = changeSelectedIfNParent(x, selectedProperty, changeTo)
		}


		if (!parentId) {
			//top level 
			if (!isChild(x)) {
				x = changeSelectedIfNParent(x, selectedProperty, changeTo);
			}
		} else {
			//if parentId isnt root
			if (x.nodePath.startsWith(parentId.toString()) && x.nodePath != parentId.toString()) {

				x = changeSelectedIfNParent(x, selectedProperty, changeTo);
			}
		}
		return x;
	});
	return tree;
}

//changes selectedproperty or visual state depending on 
function changeSelectedIfNParent(node, selectedProperty, changeTo) {
	if (!node.hasChildren) {
		node[selectedProperty] = changeTo;
		node.__visual_state = changeTo;
	}else{
		node.__visual_state = changeTo;
	}
	return node;
}

export function getVisualState(tree, node, isCHild, getParentId, selectedProperty) {
	let children = getParentChildrenTree(tree, node.nodePath, isCHild, getParentId)
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

//changes status of parent of 
function recomputeAllParentVisualState(tree,nodePath,isChild,getParentId,selectedProperty){
	let parent = getParentNodePath(nodePath);
	if(getParentNodePath(parent) != '' ){
		if(tree == null){
			console.log("NULLL")
			console.log(tree)
		}
		tree = recomputeAllParentVisualState(tree,parent,isChild,getParentId,selectedProperty)
	}
	if(tree == null){
		console.log("NULLL")
		console.log(tree)
	}
	tree.forEach(x =>{
		if(x.nodePath == parent)
			x.__visual_state = getVisualState(tree,x,isChild,getParentId,selectedProperty)
	})

	return tree;
}