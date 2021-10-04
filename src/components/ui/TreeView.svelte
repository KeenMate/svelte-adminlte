<script context="module">
  import { writable } from "svelte/store";

  let _expansionState = writable({
    /* treeNodeId: expanded <boolean> */
  });
</script>

<script>
  import {
    findNestedLtreePath,
    getParentNodePath,
    nodePathIsChild,
	ChangeSelection,
	hasChildren
  } from "../../helpers/tree-helpers";
  //import Checkbox from "../form/input/Checkbox.svelte";
  //required
  export let tree = null;
  export let treeId = null;
  export let maxExpandedDepth = 0;

  export let selected;
  export let recursiv = false;
  export let checkboxes = false;
  export let value = null;
  export let childDepth = 0;
  export let parentId = null;
  export let getId = (x) => x.nodePath;
  export let getParentId = (x) => getParentNodePath(x.nodePath);
  export let isChild = (x) => nodePathIsChild(x.nodePath);

  const getNodeId = (node) => `${treeId}-${getId(node)}`;

  $: parentChildrenTree = (tree || []).filter((x) =>
    !parentId ? !isChild(x) : getParentId(x) === parentId
  );
  $: valuePath = findNestedLtreePath(tree, value);
  $: parsedMaxExpandedDepth = Number(maxExpandedDepth ?? 0);
  $: recomputeExpandedNodes(parsedMaxExpandedDepth, childDepth, tree);
  $: expandNodes(valuePath);
  $: selected
  $: deleteSelected(recursiv)


  // $: console.log("Expansion state changed", $_expansionState)

  function expandNodes(nodes) {
    if (!nodes || !nodes.length) return;

    nodes.forEach((x) => toggleExpansion(x, true));
  }

  function toggleExpansion(node, setValueTo = null) {
    // console.log("Expansioned", node, _expansionState)
    const nodeId = getNodeId(node);
    _expansionState.update((x) => ({
      ...x,
      [nodeId]: setValueTo ?? !x[nodeId],
    }));
  }

  function recomputeExpandedNodes() {
    // tree.forEach(x => toggleExpansion(x, false))
    // console.log("max depth", parsedMaxExpandedDepth, "child depth", childDepth, "tree", tree)
    if (childDepth < parsedMaxExpandedDepth) {
      expandNodes(parentChildrenTree);
      // console.log("Expand should happen")
    }
  }

  //checkboxes
  function selectionChanged(nodePath) {
    console.log(nodePath);
	selected = ChangeSelection(recursiv,tree,nodePath,selected)
  }

  function deleteSelected(recursiv) {
	  if(recursiv)
	  selected=[]
  }

</script>

<ul class:treeview={childDepth === 0} class:child-menu={childDepth > 0}>
  {#each parentChildrenTree as node (getNodeId(node))}
    <li class:is-child={isChild(node)} class:has-children={node.hasChildren}>
      <div class="tree-item" class:div-has-children={node.hasChildren}>
        {#if node.hasChildren}
          <span on:click={() => toggleExpansion(node)}>
            <i
              class="far"
              class:fa-minus-square={$_expansionState[getNodeId(node)]}
              class:fa-plus-square={!$_expansionState[getNodeId(node)]}
            />
          </span>
        {:else}
			<span></span>
        {/if}
        {#if checkboxes}
			{#if (recursiv && !hasChildren(tree,node.nodePath)) || (!recursiv)}
          		<input type="checkbox"  id="{node.nodePath}" on:change={ () => selectionChanged(node.nodePath)} 
					checked={(selected.includes(node.nodePath)?"false":"")} >
						
			{:else}
				<input type="checkbox"  id="{node.nodePath}" 
				onclick="return false;" >
        	{/if}
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
          {checkboxes}
          {getParentId}
          {maxExpandedDepth}
          bind:selected
          {tree}
		  {recursiv}
          childDepth={childDepth + 1}
          parentId={getId(node)}
          let:node={nodeNested}
        >
          <slot node={nodeNested} />
        </svelte:self>
      {/if}
	  {#if !$_expansionState[getNodeId(node)] && node.hasChildren}
	  	<ul  class:child-menu={childDepth > 0}></ul>
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
			// li:last-of-type	ul
			// 	border-left: 1px solid white
			// 	margin-left: -1px
		li
			
			border: 1px dotted black
			border-width: 0 0 1px 1px
			&:last-of-type	ul
				border-left: 1px solid white
				margin-left: -1px
			
			div
				margin-left: 0
				

			ul
				border-top:1px dotted black
				margin-left: -1px
				padding-left: 2em
			
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
// ul
// 	marign-left: 2em
// 	li:last-child 
// 		ul
// 			border-left: 1px solid white
// 			margin-left: -17px

// li
// 	padding-left: 1em
// 	border: 1px dotted black
// 	border-width: 0 0 1px 1px

// 	&.has-children
// 		border-bottom: 0px

// 	&.empty
// 		font-style: italic
// 		color: silver
// 		border-color: silver
// 	hr
// 		border-top: 1px dotted gray
// 		border: 0px white solid
// 		width: 14px
// 		margin: 0
// 	ul
// 		border-top: 1px dotted black
// 		margin-left: -1em
// 		padding-left: 2em


// .tree-item
// 	margin: 0
// 	background: white
// 	position: relative
// 	top: 0.5em
// 	display: flex
// 	align-items: center
// 	column-gap: .4rem	



</style>
<!-- 
ul
margin: 0
list-style: none
padding-left: 1.2rem
user-select: none

&.child-menu
	padding-left: 2.6rem

li
	&.is-child
		// border-left: gray
		// border-left-style: dotted
		// border-left-width: 1px


	&.has-children
		margin-left: -6px

	.tree-item
		display: flex
		align-items: center
		column-gap: .8rem

		hr
			// border-top: 1px dotted gray
			border: 0px white solid
			width: 7px
			margin: 0 -->