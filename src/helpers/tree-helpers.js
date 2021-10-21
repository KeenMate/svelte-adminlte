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

//--------------
//selection
//--------------


export function ChangeSelection(recursively, tree, nodePath,selectedProperty) {
	if (!recursively) {
    //non recursively

    return addOrRemoveSelection(tree,nodePath,selectedProperty)

  } else {
    //recursively

		//only allow selection if it doesnt have any children
		if(!hasChildren(tree,nodePath)){

			return addOrRemoveSelection(tree,nodePath,selectedProperty)
		}else{
			//change state of all children and recompute visualstate
			
		}


	return tree

  }
}

function addOrRemoveSelection(tree,nodePath,selectedProperty){
	return tree.map((x)=>{
		let t = x
		if(x.nodePath == nodePath){
			t[selectedProperty] = !x[selectedProperty]  
		}
		return t;
	})

}

export function changeExpansion(tree,nodePath,expandedProperty){
	return tree.map((x)=>{
		let t = x
		if(x.nodePath == nodePath){
			console.log(nodePath)
			t[expandedProperty] = !x[expandedProperty]  
		}
		return t;
	})

}

export function getRecSelStatus(tree,nodePath){
	if(selected.includes(node.nodePath))
		return "selected"
	
}


