
<script>
	import {
		findNestedLtreePath,
		getParentNodePath,
		nodePathIsChild,
		ChangeSelection,
		hasChildren,
		changeExpansion,
		getParentChildrenTree,
		ChangeSelectForAllChildren,
		computeInitialVisualStates
		
	} from "../../helpers/tree-helpers";
	
	//required
	export let tree = null;
	export let treeId = null;
	export let maxExpandedDepth = 0;

	export let recursiv = false;
	export let checkboxes = false;
	//if true, will show checkboxes to elements with children
	export let parent_checkboxes = false;


	export let childDepth = 0;
	export let parentId = null;

	export let expandedProperty = "__expanded";
	export let selectedProperty = "__selected";

	export let getId = (x) => x.nodePath;
	export let getParentId = (x) => getParentNodePath(x.nodePath);
	export let isChild = (x) => nodePathIsChild(x.nodePath);

	const getNodeId = (node) => `${treeId}-${getId(node)}`;

	$:parentChildrenTree =  getParentChildrenTree(tree,parentId,isChild,getParentId)

	$: parsedMaxExpandedDepth = Number(maxExpandedDepth ?? 0);

	$:console.log(tree);
	
	function expandNodes(nodes) {
		if (!nodes || !nodes.length) return;
		nodes.forEach((x) => toggleExpansion(x, true));
	}

	function toggleExpansion(node, setValueTo = null) {
		tree = changeExpansion(tree, node.nodePath, expandedProperty);
		
	}

	function recomputeExpandedNodes() {
		if (childDepth < parsedMaxExpandedDepth) {
			expandNodes(parentChildrenTree);
		}
	}

	//checkboxes
	function selectionChanged(nodePath) {
		console.log(nodePath);
		tree = ChangeSelection(recursiv, tree, nodePath,isChild, selectedProperty,getParentId);
	}

	//selectes
	function selectChildren(node,e) { 
		tree = ChangeSelectForAllChildren(tree,getId(node),isChild,selectedProperty,e.target.checked,getParentId)
	}

	//computes all visual states when component is first created
	tree = computeInitialVisualStates(tree, isChild, selectedProperty,getParentId)

	
</script>

<ul class:treeview={childDepth === 0} class:child-menu={childDepth > 0}>
	{#each parentChildrenTree as node (getNodeId(node))}
		<li class:is-child={isChild(node)} class:has-children={node.hasChildren}>
			<div class="tree-item" class:div-has-children={node.hasChildren}>
				{#if node.hasChildren}
					<span on:click={() => toggleExpansion(node)}>
						<i
							class="far"
							class:fa-minus-square={node[expandedProperty]}
							class:fa-plus-square={node[expandedProperty] != true}
						/>
					</span>
				{:else}
					<span />
				{/if}
				{#if checkboxes}
					{#if recursiv}
						{#if !hasChildren(tree, node.nodePath)}
							<input
								type="checkbox"
								id={getNodeId(node)}
								on:change={() => selectionChanged(node.nodePath)}
								checked={node[selectedProperty] ? "false" : ""}
							/>
						{:else if parent_checkboxes}
							<input
								type="checkbox"
								id={getNodeId(node)}
								on:click={(e) => {
									e.preventDefault;
									selectChildren(node, e);
								}}
								checked={node.__visual_state == "true" ? "false" : ""}
								indeterminate={node.__visual_state == "indeterminate"}
							/>
						{:else}
							<input
								type="checkbox"
								id={getNodeId(node)}
								onclick="return false;"
								class:invisible={!parent_checkboxes}
							/>
						{/if}
					{:else}
						<input
							type="checkbox"
							id={getNodeId(node)}
							on:change={() => selectionChanged(node.nodePath)}
							checked={node[selectedProperty] ? "false" : ""}
						/>
					{/if}
				{/if}
				<slot {node} />
			</div>
			<!--{@debug node}-->
			<!--{@debug $_expansionState}-->
			{#if node[expandedProperty] && node.hasChildren}
				<!--tree={tree/*.filter(x => x.nodePath.startsWith(node.nodePath) && x.nodePath !== node.nodePath)*/} -->
				<svelte:self
					{treeId}
					{getId}
					{checkboxes}
					{getParentId}
					{maxExpandedDepth}
					bind:tree
					{recursiv}
					childDepth={childDepth + 1}
					parentId={getId(node)}
					let:node={nodeNested}
					{parent_checkboxes}
				>
					<slot node={nodeNested} />
				</svelte:self>
			{/if}
			{#if node[expandedProperty] != true && node.hasChildren}
				<ul class:child-menu={childDepth > 0} />
			{/if}
		</li>
	{/each}
</ul>

<style lang="sass">
:global
	.treeview
		ul, li
			list-style: none
			margin: 0
			padding: 0
		ul
			margin-left: 1.5em
		li
			
			border: 1px dotted black
			border-width: 0 0 1px 1px
			&:last-child	> ul
				border-left: 1px solid white !important
			
			div
				margin-left: 0
				

			ul
				border-top:1px dotted black
				margin-left: -1px
				padding-left: 0.95em
				border-left: none !important
			
		.has-children
			border-bottom: 0px

		.tree-item
			display: flex
			column-gap: 0.4em
			align-items: center
			background: white
			position: relative
			top: 0.75em
			margin-left: 21px
		.div-has-children
			margin-left: 7px
		.no-arrow
			padding-left: .5rem

		.arrow
			cursor: pointer
			display: inline-block

		.arrowDown
			transform: rotate(90deg)
		.invisible
			visibility: none
</style>
