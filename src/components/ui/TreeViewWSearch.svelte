<script>
  import { FormGroup, TextInput, TreeView } from "../";

  import {searchTree,joinTrees} from "../../helpers/tree-helpers";

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
  $:filteredTree = filter(tree,queryString);
  $:console.log(tree);

  function filter(tree,queryString) {
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


  //TODO trochu zlepsit styl
  //TODO moznost expandovat vsechno v filtered tree
</script>

<FormGroup
  >{#if showInput == true}
    <TextInput placeholder="type to search" bind:value={queryString}/>
  {/if}
  {#if (filteredTree || []).length > 0 }
  <TreeView
    {treeId}
    {recursive}
    bind:filteredTree={filteredTree}
    bind:tree={tree}
    {maxExpandedDepth}
    bind:checkboxes={showCheckboxes}
    bind:leafNodeCheckboxesOnly
    {expandedProperty}
    {selectedProperty}
    let:node={node}
  >
  <slot node={node}/>
</TreeView>
{:else}
  <b>zadanemu vyrazu neodpovidaji zadne polozky</b>
{/if}
</FormGroup>
