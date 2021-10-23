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
	return children;
}
//--------------
//selection
//--------------


export function ChangeSelection(recursively, tree, nodePath,isChild, selectedProperty,getParentId) {
	if (!recursively) {
		//non recursively

		return addOrRemoveSelection(tree, nodePath, selectedProperty)

	} else {
		//recursively

		//only allow selection if it doesnt have any children
		tree =  addOrRemoveSelection(tree, nodePath, selectedProperty)
		return recomputeAllParentVisualState(tree,nodePath,isChild,selectedProperty,getParentId)


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

export function ChangeSelectForAllChildren(tree, parentId, isChild, selectedProperty, changeTo,getParentId) {
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
	tree = recomputeAllParentVisualState(tree,parentId,isChild,selectedProperty,getParentId)
	return tree;
}

//changes selectedproperty or visual state depending on 
function changeSelectedIfNParent(node, selectedProperty, changeTo) {
	if (!node.hasChildren) {
		node[selectedProperty] = changeTo;	
	}else{
		node.__visual_state = changeTo.toString();
	}
	return node;
}

export function getVisualState(tree, node, isChild, selectedProperty,getParentId) {
	let children = getParentChildrenTree(tree,node.nodePath,isChild,getParentId)
	//if every child is selected or vs=true return true
	if (children.every(x => {
				return  x[selectedProperty] === true || x.__visual_state === "true"
		})) {
		return "true"
	} else
		//not every child but at least one return indeterminate 
		if (children.some(x => {
			return x[selectedProperty] === true || x.__visual_state === 'indeterminate' || x.__visual_state === "true"
		})) {

			return "indeterminate"
		}
		else {
			return "false"
		}

}

//changes status of parent of 
function recomputeAllParentVisualState(tree,nodePath,isChild,selectedProperty,getParentId){
	
	let parent = getParentNodePath(nodePath);

	let newstate;
	tree.forEach(x =>{
		if(x.nodePath == parent){
			newstate = getVisualState(tree,x,isChild,selectedProperty,getParentId)
			x.__visual_state = newstate;
			console.log("recomputing" + parent + " ->" + newstate)
		}
		})
		if(getParentNodePath(parent) != '' ){

			tree = recomputeAllParentVisualState(tree,parent,isChild,selectedProperty,getParentId)
		}
	return tree;
}

//computes visual states for all nodes with children
export function computeInitialVisualStates(tree, isChild, selectedProperty,getParentId){
	let rootELements = getParentChildrenTree(tree,null,isChild,getParentId);
	rootELements.forEach((x)=>{
	if(x.hasChildren == true){
		tree = computeChildrenVisualStates(tree, x, isChild, selectedProperty,getParentId)
		x.__visual_state = getVisualState(tree,x,isChild,selectedProperty,getParentId)
}})
return tree;
}

function computeChildrenVisualStates(tree, node, isChild, selectedProperty,getParentId){
	//all children of the node
	let children = getParentChildrenTree(tree,node.nodePath,isChild,getParentId);
	//foreaches all children if it has children, it calls itself, then it computes __vs => will compute from childern to parent
	children.forEach(x => {
		//if it has children it will compute vs of that children
		if(x.hasChildren == true){
				console.log(x.nodePath)
				console.log(isChild)

				tree = computeChildrenVisualStates(tree, x, isChild, selectedProperty,getParentId)
				x.__visual_state = getVisualState(tree,x,isChild,selectedProperty,getParentId)
		}
	})

	return tree;
}