<script>
	import {
		FormGroup,
		InputGroup,
		InputGroupAppend,
		LteButton,
		TextInput,
		TreeView,
	} from "../../index";

	/* Tree view helpers */

	function getParentNodePath(nodePath) {
		return nodePath.substring(0, nodePath.lastIndexOf("."));
	}

	function getParentChildrenTree(tree, parentId, isChild, getParentId) {
		return (tree || []).filter((x) =>
			!parentId ? !isChild(x) : getParentId(x) === parentId
		);
	}

	function getAllLeafNodes(tree) {
		return tree.filter((x) => {
			return x.hasChildren == undefined || x.hasChildren == false;
		});
	}

	function joinTrees(filteredTree, tree) {
		return tree.map(
			(tnode) =>
				filteredTree.find((fnode) => tnode.nodePath === fnode.nodePath) || tnode
		);
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
	export let noDataFoundText = "No data found.";

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

<FormGroup>
	{#if showInput}
		<InputGroup>
			<TextInput placeholder="type to search" bind:value={queryString} />
			<InputGroupAppend>
				<LteButton on:click={expansionClickHandler}>
					{#if expand}
						expand
					{:else}
						condense
					{/if}
				</LteButton>
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
