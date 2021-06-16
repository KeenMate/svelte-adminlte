<script context="module">
	import {writable} from "svelte/store"

	let _expansionState = writable({
		/* treeNodeId: expanded <boolean> */
	})
</script>

<script>
	import {findNestedPath} from "../../helpers/nested-search"

	export let tree = null
	export let treeId = null
	export let value = null
	export let childDepth = 0
	export let maxExpandedDepth = 0
	export let getId = x => x.id
	export let getParentId = x => x.parentId

	const getNodeId = node => `${treeId}-${getId(node)}`

	$: valuePath = findNestedPath(tree, node => getNodeId(node) === value)
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
		// console.log("max depth", parsedMaxExpandedDepth, "child depth", childDepth, "tree", tree)
		if (childDepth < parsedMaxExpandedDepth) {
			expandNodes(tree)
			// console.log("Expand should happen")
		}
	}
</script>

<ul class:child-menu={childDepth > 0}>
	{#each tree as node (getNodeId(node))}
		<li
			class:is-child={getParentId(node) && !node.children}
			class:has-children={node.children && node.children.length}
		>
			<div class="tree-item">
				{#if node.children && node.children.length}
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
			{#if $_expansionState[getNodeId(node)] && node.children && node.children.length}
				<svelte:self
					{treeId}
					{getId}
					{getParentId}
					{maxExpandedDepth}
					tree={node.children}
					childDepth={childDepth + 1}
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
			padding-left: 2.4rem

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
				column-gap: .5rem

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
