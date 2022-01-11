<script>
  import { FormGroup, TextInput, TreeView, LteButton, InputGroup, InputGroupAppend } from "../..";

  /* Tree view helpers */

  function getParentNodePath(nodePath) {
    return nodePath.substring(0, nodePath.lastIndexOf("."));
  }

  function hasChildren(tree, nodePath) {
    return tree.find((x) => getParentNodePath(x.nodePath) === nodePath);
  }

  function findNestedLtreePath(tree, nodePath) {
    if (!nodePath) return [];

    const parents = getLtreeParents(nodePath);

    return tree.filter((x) => parents.includes(x.nodePath));
  }

  function getLtreeParents(nodePath, acc = []) {
    const parentNodePath = getParentNodePath(nodePath);

    return (!parentNodePath && acc) || getLtreeParents(parentNodePath, [parentNodePath, ...acc]);
  }

  function nodePathIsChild(nodePath) {
    return !nodePath || !!(nodePath.match(/\./g) || []).length;
  }

  function getParentChildrenTree(tree, parentId, isChild, getParentId) {
    return (tree || []).filter((x) => (!parentId ? !isChild(x) : getParentId(x) === parentId));
  }

  function allCHildren(tree, parentId, isChild) {
    let children;
    children = tree.filter((x) => {
      if (!parentId) {
        //top level
        return !isChild(x);
      } else {
        return x.nodePath.startsWith(parentId.toString());
      }
    });
    return children;
  }

  function getAllLeafNodes(tree) {
    return tree.filter((x) => {
      return x.hasChildren == undefined || x.hasChildren == false;
    });
  }

  function joinTrees(filteredTree, tree) {
    return tree.map((tnode) => filteredTree.find((fnode) => tnode.nodePath === fnode.nodePath) || tnode);
  }
  //!! selection

  function ChangeSelection(recursiveely, tree, nodePath, isChild, selectedProperty, getParentId, filteredTree) {
    if (!recursiveely) {
      //non recursiveely

      return addOrRemoveSelection(tree, nodePath, selectedProperty);
    } else {
      //recursiveely

      //only allow selection if it doesnt have any children
      tree = addOrRemoveSelection(tree, nodePath, selectedProperty);
      return recomputeAllParentVisualState(tree, nodePath, isChild, selectedProperty, getParentId, filteredTree);
    }
  }

  function addOrRemoveSelection(tree, nodePath, selectedProperty) {
    return tree.map((x) => {
      let t = x;
      if (x.nodePath == nodePath) {
        t[selectedProperty] = !x[selectedProperty];
        t.__visual_state = !x[selectedProperty];
      }
      return t;
    });
  }

  function changeExpansion(tree, nodePath, expandedProperty) {
    return tree.map((x) => {
      let t = x;
      if (x.nodePath == nodePath) {
        t[expandedProperty] = !x[expandedProperty];
      }
      return t;
    });
  }

  function ChangeSelectForAllChildren(
    tree,
    parentId,
    isChild,
    selectedProperty,
    changeTo,
    getParentId,
    filteredTree
  ) {
    tree = tree.map((x) => {
      //changes itself
      if (parentId == x.nodePath) {
        x = changeSelectedIfNParent(x, selectedProperty, changeTo);
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
    tree = recomputeAllParentVisualState(tree, parentId, isChild, selectedProperty, getParentId, filteredTree);
    return tree;
  }

  //changes selectedproperty or visual state depending on
  function changeSelectedIfNParent(node, selectedProperty, changeTo) {
    if (!node.hasChildren) {
      node[selectedProperty] = changeTo;
    } else {
      node.__visual_state = changeTo.toString();
    }
    return node;
  }

  function getVisualState(filteredTree, node, isChild, selectedProperty, getParentId) {
    let children = getParentChildrenTree(filteredTree, node.nodePath, isChild, getParentId);
    //if every child is selected or vs=true return true
    if (
      children.every((x) => {
        return x[selectedProperty] === true || x.__visual_state === "true";
      })
    ) {
      return "true";
    }
    //not every child but at least one return indeterminate
    else if (
      children.some((x) => {
        return x[selectedProperty] === true || x.__visual_state === "indeterminate" || x.__visual_state === "true";
      })
    ) {
      return "indeterminate";
    } else {
      return "false";
    }
  }

  //changes status of all parents of given nodepath until root
  function recomputeAllParentVisualState(tree, nodePath, isChild, selectedProperty, getParentId, filteredTree) {
    let parent = getParentId({ nodePath: nodePath });

    let newstate;
    filteredTree.forEach((x) => {
      if (x.nodePath == parent) {
        newstate = getVisualState(filteredTree, x, isChild, selectedProperty, getParentId);
        x.__visual_state = newstate;
        console.log("recomputing" + parent + " ->" + newstate);
      }
    });
    if (getParentNodePath(parent) != "") {
      tree = recomputeAllParentVisualState(tree, parent, isChild, selectedProperty, getParentId, filteredTree);
    }
    return tree;
  }

  //computes visual states for all nodes with children
  function computeInitialVisualStates(tree, isChild, selectedProperty, getParentId, filteredTree) {
    let rootELements = getParentChildrenTree(tree, null, isChild, getParentId);
    rootELements.forEach((x) => {
      if (x.hasChildren == true) {
        tree = computeChildrenVisualStates(tree, x, isChild, selectedProperty, getParentId, filteredTree);
        x.__visual_state = getVisualState(filteredTree, x, isChild, selectedProperty, getParentId);
      }
    });
    return tree;
  }

  function computeChildrenVisualStates(tree, node, isChild, selectedProperty, getParentId, filteredTree) {
    let children = getParentChildrenTree(tree, node.nodePath, isChild, getParentId);
    //foreaches all children if it has children, it calls itself, then it computes __vs => will compute from childern to parent
    children.forEach((x) => {
      if (x.hasChildren == true) {
        tree = computeChildrenVisualStates(tree, x, isChild, selectedProperty, getParentId, filteredTree);
        x.__visual_state = getVisualState(filteredTree, x, isChild, selectedProperty, getParentId);
      }
    });
    return tree;
  }

  function deleteSelected(tree) {
    return tree.map((t) => {
      let x = t;
      x.__selected = false;
      x.__visual_state = "false";
      return x;
    });
  }

  //!! SEARCHING AND FILTERING

  function searchTree(tree, filterFunction, recursive) {
    let result = [],
      matchingNodes = [];
    if (recursive) {
      matchingNodes = getAllLeafNodes(tree).filter(filterFunction);
    } else {
      matchingNodes = tree.filter(filterFunction);
    }
    //console.log("matching nodes length:" + matchingNodes.length)
    matchingNodes.forEach((node) => {
      result.push(node);
      result = addParents(tree, result, node);
    });
    //console.log(result)
    return result;
  }

  function addParents(tree, result, node) {
    let parentsIds = [],
      parentNodes = [];
    if (result === undefined) result = [];
    let nodePath = node.nodePath;
    while (nodePath.length > 0) {
      nodePath = getParentNodePath(nodePath);
      parentsIds.push(nodePath);
    }

    //finds nodes for ids
    tree.forEach((n) => {
      if (
        parentsIds.some((parentId) => {
          return n.nodePath === parentId;
        })
      ) {
        parentNodes.push(n);
      }
    });
    //removes duplicate nodePaths
    parentNodes.forEach((n) => {
      if (
        result.findIndex((x) => {
          return n.nodePath === x.nodePath;
        }) < 0
      )
        result.push(n);
    });

    return result;
  }

  function changeEveryExpansion(tree, expandedProperty, changeTo) {
    return tree.map((node) => {
      node[expandedProperty] = changeTo;
      return node;
    });
  }

  /* Tree view helpers end */

  export let queryString = "";
  export let showInput = true;

  export let tree;
  export let treeId;
  export let maxExpandedDepth = 5;
  export let recursive = true;
  export let showCheckboxes = true;
  export let leafNodeCheckboxesOnly = false;
  export let expandedProperty = "__expanded";
  export let selectedProperty = "__selected";
  export let disableOrHide = false;
  export let noDataFoundText = "No data found."

  let expand = true;
  $: filteredTree = filter(tree, queryString);
  $: showInputChanged(showInput);
  function filter(tree, queryString) {
    return searchTree(
      tree,
      (x) => {
        return queryString !== undefined || queryString !== ""
          ? x.title.toLowerCase().includes(queryString.toString().toLowerCase())
          : true;
      },
      recursive
    );
  }

  function showInputChanged(showInput) {
    if (showInput == false) {
      queryString = "";
      filteredTree = tree;
    }
  }

  function expansionClickHandler() {
    tree = changeEveryExpansion(tree, expandedProperty, expand);
    expand = !expand;
  }
</script>

<FormGroup
  >{#if showInput == true}
    <InputGroup>
      <TextInput placeholder="type to search" bind:value={queryString} />
      <InputGroupAppend>
        <LteButton on:click={expansionClickHandler}
          >{#if expand} expand {:else}condense{/if}</LteButton
        >
      </InputGroupAppend>
    </InputGroup>
  {/if}
  {#if (filteredTree || []).length > 0}
    <TreeView
      {treeId}
      {recursive}
      bind:filteredTree
      bind:tree
      {maxExpandedDepth}
      bind:checkboxes={showCheckboxes}
      bind:leafNodeCheckboxesOnly
      {expandedProperty}
      {selectedProperty}
      {disableOrHide}
      let:node
    >
      <slot {node} />
    </TreeView>
  {:else}
    <b>{noDataFoundText}</b>
  {/if}
</FormGroup>
