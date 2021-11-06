<script>
  import { FormGroup, TextInput, TreeView, LteButton,InputGroup,InputGroupAppend} from "../";

  import {searchTree,changeEveryExpansion} from "../../helpers/tree-helpers";

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

  let expand= true;
  $:filteredTree = filter(tree,queryString);
  $:showInputChanged(showInput)
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

  function showInputChanged(showInput) {
    if(showInput == false){
      queryString="";
      filteredTree = tree;
    }
  }

  function expansionClickHandler() {
    tree = changeEveryExpansion(tree,expandedProperty,expand);
    expand = !expand
  }
</script>

<FormGroup
  >{#if showInput == true}
  <InputGroup>
    <TextInput placeholder="type to search" bind:value={queryString}/>
    <InputGroupAppend>
    <LteButton on:click={expansionClickHandler}>{#if expand} expand {:else}condense{/if}</LteButton>
  </InputGroupAppend>
  </InputGroup>
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
    {disableOrHide}
    let:node={node}
  >
  <slot node={node}/>
</TreeView>
{:else}
  <b>zadanemu vyrazu neodpovidaji zadne polozky</b>
{/if}
</FormGroup>
