<script>
  import { onMount } from "svelte";
  import toastr from "../helpers/toastr-helpers";

  import { Checkbox, Card, LteButton, TextInput ,LteSwitch,Radio,FormGroup,Label,TreeView,TreeViewWSearch} from "../components";

  //FIXME delete when done testing
  import { addParents, searchTree ,deleteSelected } from "../helpers/tree-helpers";

  let tree = [
    { nodePath: "1", title: "1", __visual_state: "indeterminate" },
    { nodePath: "2", title: "2" },

    { nodePath: "3", title: "3", hasChildren: true, __expanded: true },
    { nodePath: "3.1", title: "Hecarim" },
    { nodePath: "3.2", 
    title: "3.2", 
    hasChildren: true,
     __expanded: false },
    {
      nodePath: "3.2.2",
      title: "Visage",
      __expanded: true,
      __selected: true,
      test: "test223",
    },
    {
      nodePath: "3.2.3",
      title: "Lycan",
      __expanded: true,
      __selected: true,
      test: "test223",
    },
    {
      nodePath: "3.2.4",
      title: "Bloodseeker",
      __expanded: true,
      __selected: true,
    },

    { nodePath: "3.3", title: "3.3", hasChildren: true, __expanded: true },

    {
      nodePath: "3.3.1",
      title: "3.3.1",
      __expanded: true,
      __selected: false,
    },
    { nodePath: "3.4", title: "	Omniknight" },

    { nodePath: "4", title: "	Necrophos" },
    { nodePath: "5", title: "	Underlord" },

    { nodePath: "6", title: "6", hasChildren: true },
    { nodePath: "6.1", title: "6.1", hasChildren: true },
    { nodePath: "6.1.1", title: "	Death Prophet", __selected: true },

    { nodePath: "6.1.2", title: "Outworld Destroyer" },
    { nodePath: "6.1.3", title: "Puck" },
    { nodePath: "6.2", title: "6.2", hasChildren: true },

    { nodePath: "6.2.1", title: "6.2.1", hasChildren: true },

    { nodePath: "6.2.1.1", title: "Sniper" },
    { nodePath: "6.2.1.2", title: "	Alchemist" },
    { nodePath: "6.2.1.3", title: "Mirana" },
    { nodePath: "6.2.2", title: "Batrider" },
    { nodePath: "7", title: "7" },
    { nodePath: "8", title: "8", hasChildren: true },
    { nodePath: "8.1", title: "8.1", hasChildren: true },
    { nodePath: "8.1.1", title: "Night Stalker" },

    { nodePath: "8.1.2", title: "Lycan" },
    { nodePath: "8.1.3", title: "Troll Warlord" },
    { nodePath: "8.2", title: "8.2", hasChildren: true },

    { nodePath: "8.2.1", title: "8.2.1", hasChildren: true },

    { nodePath: "8.2.1.1", title: "Bane" },
    { nodePath: "8.2.1.2", title: "Ogre Magi" },
    { nodePath: "8.2.1.3", title: "Luna" },
    { nodePath: "8.2.2", title: "Keeper of the Light" },
  ];

  $: filteredTree = filter(tree, hideGroup);
  $:console.log(tree);

  let showCheckboxes = true;
  let hideGroup = 1;
  let showTree = true;
  let recursive = true;
  let leafNodeCheckboxesOnly = false;

  function filter(tree, hide) {
    return tree.filter((t) => !t.nodePath.startsWith(hide.toString()))
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
        <TreeViewWSearch
          {recursive}
          bind:filteredTree
          bind:tree
          maxExpandedDepth="4"
          let:node
          bind:checkboxes={showCheckboxes}
          bind:leafNodeCheckboxesOnly
        >
          {node.title}
        </TreeViewWSearch>
      {/if}

    </Card>
  </div>
  <div class="col-3">
    <Card outline color="primary">
      <svelte:fragment slot="header">Tree options</svelte:fragment>
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
        {#each tree as node}
          {#if node.__selected === true}
            <li>{node.nodePath} - {node.title}</li>
          {/if}
          <!-- {tr.__selected} - {tr.nodePath} <br/> -->
        {/each}
      </ul>
      <LteButton on:click={() =>tree = deleteSelected(tree)}>delete selected</LteButton>
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
            { nodePath: "6.2.1.2" }
          )}>add test</LteButton
      >
      <LteButton
        on:click={() =>
          searchTree(tree, (x) => {
            return x.nodePath.includes("3");
          })}
      >
        searchtest</LteButton
      >
    </Card>
  </div>
</div>
