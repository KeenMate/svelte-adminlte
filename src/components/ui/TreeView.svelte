<script context="module">
	import {writable} from "svelte/store"

	let _expansionState = writable({
		/* treeNodeId: expanded <boolean> */
	})
</script>

<script>
	import {findNestedLtreePath, getParentNodePath, nodePathIsChild} from "../../helpers/tree-helpers"

	export let tree = null
	export let treeId = null
	export let value = null
	export let childDepth = 0
	export let parentId = null
	export let maxExpandedDepth = 0
	export let getId = x => x.nodePath
	export let getParentId = x => getParentNodePath(x.nodePath)
	export let isChild = x => nodePathIsChild(x.nodePath)

	const getNodeId = node => `${treeId}-${getId(node)}`

	$: parentChildrenTree = (tree || []).filter(x => !parentId ? !isChild(x) : getParentId(x) === parentId)
	$: valuePath = findNestedLtreePath(tree, value)
	$: parsedMaxExpandedDepth = Number(maxExpandedDepth ?? 0)
	$: recomputeExpandedNodes(parsedMaxExpandedDepth, childDepth, tree)
	$: expandNodes(valuePath)
	// $: console.log("Expansion state changed", $_expansionState)

	function expandNodes(nodes) {
		if (!nodes || !nodes.length)
			return

		nodes.forEach(x => toggleExpansion(x, true))
	}

	function toggleExpansion(node, setValueTo = null) {
		// console.log("Expansioned", node, _expansionState)
		const nodeId = getNodeId(node)
		_expansionState.update(x => ({
			...x,
			[nodeId]: (setValueTo ?? !x[nodeId])
		}))
	}

	function recomputeExpandedNodes() {
		// tree.forEach(x => toggleExpansion(x, false))
		// console.log("max depth", parsedMaxExpandedDepth, "child depth", childDepth, "tree", tree)
		if (childDepth < parsedMaxExpandedDepth) {
			expandNodes(parentChildrenTree)
			// console.log("Expand should happen")
		}
	}
</script>

<ul class:child-menu={childDepth > 0}>
	{#each parentChildrenTree as node (getNodeId(node))}
		<li
			class:is-child={isChild(node)}
			class:has-children={node.hasChildren}
		>
			<div class="tree-item">
				{#if node.hasChildren}
					<span on:click={() => toggleExpansion(node)}>
						<i
							class="far"
							class:fa-minus-square={$_expansionState[getNodeId(node)]}
							class:fa-plus-square={!$_expansionState[getNodeId(node)]}
						>
						</i>
					</span>
				{:else}
					<hr />
				{/if}

				<slot {node} />
			</div>
			<!--{@debug node}-->
			<!--{@debug $_expansionState}-->
			{#if $_expansionState[getNodeId(node)] && node.hasChildren}
					<!--tree={tree/*.filter(x => x.nodePath.startsWith(node.nodePath) && x.nodePath !== node.nodePath)*/} -->
				<svelte:self
					{treeId}
					{getId}
					{getParentId}
					{maxExpandedDepth}
					tree={tree}
					childDepth={childDepth + 1}
					parentId={getId(node)}
					let:node={nodeNested}
				>
					<slot node={nodeNested} />
				</svelte:self>
			{/if}
		</li>
	{/each}
</ul>

<style lang="sass">

	ul
		margin: 0
		list-style: none
		padding-left: 1.2rem
		user-select: none

		&.child-menu
			padding-left: 2.6rem

		li
			&.is-child
				border-left: gray
				border-left-style: dotted
				border-left-width: 1px


			&.has-children
				margin-left: -6px

			.tree-item
				display: flex
				align-items: center
				column-gap: .8rem

				hr
					border-top: 1px dotted gray
					width: 7px
					margin: 0

	.no-arrow
		padding-left: .5rem

	.arrow
		cursor: pointer
		display: inline-block

	.arrowDown
		transform: rotate(90deg)

</style>
