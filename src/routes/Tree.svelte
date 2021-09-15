<script>
  import { Checkbox, Card } from "../components";
  import LteSwitch from "../components/form/input/LteSwitch.svelte";
  import Radio from "../components/form/input/Radio.svelte";
  import FormGroup from "../components/form/structure/FormGroup.svelte";
  import Label from "../components/form/structure/Label.svelte";
  import TreeView from "../components/ui/TreeView.svelte";

  const tree = [
    { nodePath: "1", title: "1" },
    { nodePath: "2", title: "2" },

    { nodePath: "3", title: "3", hasChildren: true },
    { nodePath: "3.1", title: "3.1" },
    { nodePath: "3.2", title: "3.2", hasChildren: true },

    { nodePath: "3.2.1", title: "3.2.1", hasChildren: true },

    { nodePath: "3.2.1.1", title: "3.2.1.1" },
  ];

  $: filteredTree = filter(tree, hideGroup);

  let showCheckboxes = false;
  let hideGroup = 1;
  let showTree = true;

  function filter(tree, hide) {
    return tree.filter((t) => !t.nodePath.startsWith(hide.toString()));
  }

  // jquery("[name='my-checkbox']").bootstrapSwitch();
</script>

<div class="row">
  <div class="col-5">
    <Card outline color="primary">
      <svelte:fragment slot="header">Tree</svelte:fragment>
      {#if showTree}
        <TreeView tree={filteredTree} maxExpandedDepth="3" let:node>
          {#if showCheckboxes}
            Checkbox
          {/if}
          {node.title}
        </TreeView>
      {/if}
    </Card>
  </div>
  <div class="col-3">
    <Card outline color="primary">
      <svelte:fragment slot="header">Tree options</svelte:fragment>
      <FormGroup>
        <Checkbox level="danger" name="show-checkboxes" id="show-checkboxes" bind:checked={showCheckboxes}>
          <Label inputId="show-checkboxes">Show checkboxes</Label>
        </Checkbox>
      </FormGroup>
      <FormGroup>
        <Checkbox>
          <Radio id="hide1" bind:group={hideGroup} name="hide" value={1}><Label inputId="hide1">Hide 1</Label></Radio>
        </Checkbox>
        <Checkbox>
          <Radio id="hide2" level="warning" bind:group={hideGroup} name="hide" value={2}>
            <Label inputId="hide2">Hide 2</Label>
          </Radio>
        </Checkbox>
        <Checkbox>
          <Radio id="hide3" level="danger" bind:group={hideGroup} name="hide" value={3}>
            <Label inputId="hide3">Hide 3</Label>
          </Radio>
        </Checkbox>
      </FormGroup>
      <LteSwitch checkedClass="bg-green" uncheckedClass="bg-gray" bind:checked={showTree} />
    </Card>
  </div>
  <div class="col-4">
    <Card outline color="primary"><svelte:fragment slot="header">What's this</svelte:fragment></Card>
  </div>
</div>

<!-- <script>
  import {
    Form,
    Checkbox,
    CheckboxLabel,
    CheckboxInput,
    TreeView,
  } from "../components";
  const tree = [
    { nodePath: "1", title: "1" },
    { nodePath: "2", title: "2" },

    { nodePath: "3", title: "3", hasChildren: true },
    { nodePath: "3.1", title: "3.1" },
    { nodePath: "3.2", title: "3.2", hasChildren: true },

    { nodePath: "3.2.1", title: "3.2.1", hasChildren: true },

    { nodePath: "3.2.1.1", title: "3.2.1.1" },
  ];
</script>

<div class="row">
  <div class="col-9">
    
  </div>
  <div class="col-3">
    <Form>
      <h2>Konfigurae</h2>
      <Checkbox>
        <CheckboxInput id="show" name="show" title="show" />
        <CheckboxLabel inputId="show">Show</CheckboxLabel>
      </Checkbox>
    </Form>
  </div>
</div> -->
