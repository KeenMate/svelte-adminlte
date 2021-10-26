<script>
  import { onMount } from "svelte";
  import toastr from "../helpers/toastr-helpers";

  import { Checkbox, Card, LteButton,TextInput } from "../components";
  import LteSwitch from "../components/form/input/LteSwitch.svelte";
  import Radio from "../components/form/input/Radio.svelte";
  import FormGroup from "../components/form/structure/FormGroup.svelte";
  import Label from "../components/form/structure/Label.svelte";
  import TreeView from "../components/ui/TreeView.svelte";

  //FIXME delete when done testing 
  import { addParents, searchTree } from "../helpers/tree-helpers";

  let tree = [
    { nodePath: "1", title: "FIRST", __visual_state: "indeterminate" },
    { nodePath: "2", title: "2" },

    { nodePath: "3", title: "3", hasChildren: true, __expanded: true },
    { nodePath: "3.1", title: "3.1" },
    { nodePath: "3.2", title: "3.2", hasChildren: true, __expanded: false },

    {
      nodePath: "3.2.1",
      title: "3.2.1",
      hasChildren: true,
      test: "test223",
    },
    { nodePath: "3.2.1.1", title: "3.2.1.1" },
    {
      nodePath: "3.2.2",
      title: "3.2.1",
      __expanded: true,
      __selected: true,
      test: "test223",
    },
    {
      nodePath: "3.2.3",
      title: "3.2.1",
      __expanded: true,
      __selected: true,
      test: "test223",
    },
    {
      nodePath: "3.2.4",
      title: "3.2.1",
      __expanded: true,
      __selected: true,
    },

    { nodePath: "3.3", title: "3.3", hasChildren: true, __expanded: true },

    {
      nodePath: "3.3.1",
      title: "3.3.1",
      hasChildren: true,
      __expanded: true,
      __selected: true,
    },
    { nodePath: "3.4", title: "3.4" },

    { nodePath: "4", title: "4" },
    { nodePath: "5", title: "5" },

    { nodePath: "6", title: "6", hasChildren: true },
    { nodePath: "6.1", title: "6.1", hasChildren: true },
    { nodePath: "6.1.1", title: "6.2.1", __selected: true },

    { nodePath: "6.1.2", title: "6.1.2" },
    { nodePath: "6.1.3", title: "6.1.3" },
    { nodePath: "6.2", title: "6.2", hasChildren: true },

    { nodePath: "6.2.1", title: "6.2.1", hasChildren: true },

    { nodePath: "6.2.1.1", title: "6.2.1.1" },
    { nodePath: "6.2.1.2", title: "6.2.1.2" },
    { nodePath: "6.2.1.3", title: "6.2.1.3" },
    { nodePath: "6.2.2", title: "6.2.2" },
    { nodePath: "7", title: "7" },
    { nodePath: "8", title: "6", hasChildren: true },
    { nodePath: "8.1", title: "6.1", hasChildren: true },
    { nodePath: "8.1.1", title: "6.2.1" },

    { nodePath: "8.1.2", title: "6.1.2" },
    { nodePath: "8.1.3", title: "6.1.3" },
    { nodePath: "8.2", title: "6.2", hasChildren: true },

    { nodePath: "8.2.1", title: "6.2.1", hasChildren: true },

    { nodePath: "8.2.1.1", title: "6.2.1.1" },
    { nodePath: "8.2.1.2", title: "6.2.1.2" },
    { nodePath: "8.2.1.3", title: "6.2.1.3" },
    { nodePath: "8.2.2", title: "6.2.2" },
  ];

  $: filteredTree = filter(tree, hideGroup)

  let showCheckboxes = true;
  let hideGroup = 1;
  let showTree = true;
  let recursive = true;
  let leafNodeCheckboxesOnly = false;
  let queryString = "";

  function filter(tree, hide) {
    return tree.filter((t) => !t.nodePath.startsWith(hide.toString()));
  }

  function deleteSelected() {
    tree = tree.map((t) => {
      let x = t;
      x.__selected = false;
      x.__visual_state = "false";
      return x;
    });
  }

  onMount(() => {
    toastr.success("Hello there");
    console.log("Called toastr", toastr);
  });
</script>

<div class="row">
  <div class="col-5">
    <Card outline color="primary">
      <svelte:fragment slot="header">Tree</svelte:fragment>
      {#if showTree}
        <TreeView
          {recursive}
          bind:tree={filteredTree}
          maxExpandedDepth="4"
          let:node
          bind:checkboxes={showCheckboxes}
          bind:leafNodeCheckboxesOnly
          {queryString}
        >
          {node.nodePath}
        </TreeView>
      {/if}
    </Card>
  </div>
  <div class="col-3">
    <Card outline color="primary">
      <svelte:fragment slot="header">Tree options</svelte:fragment>
      <FormGroup>
        <TextInput bind:value={queryString} id="query_string" placeholder="search"></TextInput>
        
      </FormGroup>
      <FormGroup>
        <Checkbox
          level="danger"
          name="show-checkboxes"
          id="show-checkboxes"
          bind:checked={showCheckboxes}
        >
          <Label inputId="show-checkboxes">Show checkboxes</Label>
        </Checkbox>
      </FormGroup>
      <FormGroup>
        <Checkbox
          level="danger"
          name="recursivee-selection"
          id="recursivee-selection"
          bind:checked={recursive}
        >
          <Label inputId="recursivee-selection">recursivee selection</Label>
        </Checkbox>
      </FormGroup>
      <FormGroup>
        <Checkbox
          level="danger"
          name="leafNodeCheckboxesOnly"
          id="leafNodeCheckboxesOnly"
          bind:checked={leafNodeCheckboxesOnly}
        >
          <Label inputId="leafNodeCheckboxesOnly"
            >leaf node checkboxes only</Label
          >
        </Checkbox>
      </FormGroup>
      <FormGroup>
        <Checkbox>
          <Radio id="hide1" bind:group={hideGroup} name="hide" value={1}
            ><Label inputId="hide1">Hide 1</Label></Radio
          >
        </Checkbox>
        <Checkbox>
          <Radio
            id="hide2"
            level="warning"
            bind:group={hideGroup}
            name="hide"
            value={2}
          >
            <Label inputId="hide2">Hide 2</Label>
          </Radio>
        </Checkbox>
        <Checkbox>
          <Radio
            id="hide3"
            level="danger"
            bind:group={hideGroup}
            name="hide"
            value={3}
          >
            <Label inputId="hide3">Hide 3</Label>
          </Radio>
        </Checkbox>
      </FormGroup>
      <LteSwitch
        checkedClass="bg-green"
        uncheckedClass="bg-gray"
        bind:checked={showTree}
      />
    </Card>
  </div>
  <div class="col-4">
    <Card outline color="primary"
      ><svelte:fragment slot="header">Selected</svelte:fragment>
      <ul>
        {#each tree as tr}
          {#if tr.__selected === true}
            <li>{tr.nodePath}</li>
          {/if}
          <!-- {tr.__selected} - {tr.nodePath} <br/> -->
        {/each}
      </ul>
      <LteButton on:click={deleteSelected}>delete selected</LteButton>
      <!-- FIXME delete when done testing-->
      <LteButton
        on:click={() =>
          addParents(
            tree,
            [
              { nodePath: "6" },
              {
                nodePath: "6",
                title: "6",
                hasChildren: true,
                __visual_state: "indeterminate",
              },
              { nodePath: "6.2.1" },
            ],
            { nodePath: "6.2.1.2" },
            (node) => node.nodePath.substring(0, node.nodePath.lastIndexOf("."))
          )}>add test</LteButton
      >
      <LteButton
        on:click={() =>
          searchTree(
            tree,
            (x) => {
              return x.nodePath.includes("3");
            },
            (node) => node.nodePath.substring(0, node.nodePath.lastIndexOf("."))
          )}
      >
        searchtest</LteButton
      >
    </Card>
  </div>
</div>
