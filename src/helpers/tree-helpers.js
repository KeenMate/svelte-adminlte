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


export function ChangeSelection(recursively, tree, nodePath, selected) {
	if (!recursively) {
    //non recursively

    return addOrRemoveSelection(selected,nodePath)

  } else {
    //recursively

	//only allow selection if it doesnt have any children
	if(!hasChildren(tree,nodePath)){

		return addOrRemoveSelection(selected,nodePath)
	}


	return selected

  }
}

function addOrRemoveSelection(selected,nodePath){
	if (selected.includes(nodePath)) {
		var index = selected.indexOf(nodePath);
		if (index > -1) {
		  selected.splice(index, 1);
		}
	  } else {
		selected.push(nodePath);
	  }
	return selected;
}

export function getRecSelStatus(selected,nodePath){
	if(selected.includes(node.nodePath))
		return "selected"
	
}


