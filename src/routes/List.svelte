<script>
  import { sortBy, maxBy } from "lodash";
  import { Sortable, MultiDrag } from "sortablejs";
  import { onMount } from "svelte";
  // import { Sortable, Plugins } from "@shopify/draggable";
  import { Card, Callout, LteButton } from "../components";
  import CreateCarModal from "../controls/list/CreateCarModal.svelte";

  onMount(() => {
    try {
      Sortable.mount(new MultiDrag());
    } catch (err) {
      throw err
    }
  });

  let items = [
    {
      title: "Lexus",
    },
    {
      title: "Aston Martin",
    },
    {
      title: "McLaren",
    },
    {
      title: "Alfa Romeo",
    },
    {
      title: "Bugatti",
    },
  ];

  let order = items.map((item, index) => ({
    currentIndex: index,
    title: item.title,
  }));

  let list;
  let sortable;

  let showCreateCar;

  const store = {
    set(sortable) {
      console.log("sortable set", sortable);
      console.log("children", sortable.toArray());
    },
  };

  $: {
    if (list) {
      sortable = new Sortable(list, {
        store,
        multiDrag: true,
        selectedClass: "draggable-selected",
        // multiDragKey: "CTRL",
        draggable: ".draggable-callout",
        handle: ".draggable-handle",
        animation: 150,
        onEnd: handleDragStop,
      });
    }
  }

  function handleDragStop(event) {
    let oldIndex = event.oldIndex;
    let newIndex = event.newIndex;

    order.map((i) => {
      if (oldIndex < newIndex) {
        // oldIndex = 0, newIndex = 4
        // items 1 to 3 => index -= 1
        // item 0 index = 4

        if (i.currentIndex > oldIndex && i.currentIndex <= newIndex) {
          i.currentIndex -= 1;
        } else if (i.currentIndex == oldIndex) {
          i.currentIndex = newIndex;
        }
      }

      if (oldIndex > newIndex) {
        // oldIndex = 4, newIndex = 0
        // item 3 to 0 index += 1
        // item 4 index = 0

        if (i.currentIndex < oldIndex && i.currentIndex >= newIndex) {
          i.currentIndex += 1;
        } else if (i.currentIndex == oldIndex) {
          i.currentIndex = newIndex;
        }
      }
    });

    order = order;
  }

  function addCar({ detail: car }) {
    console.log("adding car", car);

    items.push({ title: car.manufacturer.label });
    let newIndex = maxBy(order, "currentIndex").currentIndex;

    console.log("new index", newIndex);

    order.push({ currentIndex: newIndex + 1, title: car.manufacturer.label });

    console.log("items", items);
    console.log("order", order);

    items = items;
    order = order;
  }
</script>

<!-- Favorite cars (top 5) - manufacturer, model -->
<!-- Add, remove, edit functionality-->

<div class="row">
  <div class="col-6">
    <Card outline color="primary">
      <svelte:fragment slot="header">Favorite cars</svelte:fragment>

      <LteButton slot="tools" color="success" small on:click={() => showCreateCar()}>
        <i class="fas fa-plus" />
      </LteButton>

      <div bind:this={list} id="draggable-list">
        {#each items as item, i}
          <div data-id={i} class="draggable-callout">
            <Callout color="info">
              <div class="d-inline-flex">
                <div class="draggable-handle text-muted mr-2">
                  <i class="fas fa-grip-vertical" />
                </div>
                <p>{item.title}</p>
              </div>
            </Callout>
          </div>
        {/each}
      </div>
    </Card>
  </div>
  <div class="col-6">
    <Card>
      <svelte:fragment slot="header">Current order</svelte:fragment>

      <ul>
        {#each sortBy(order, ["currentIndex"]) as item}
          <li>{item.currentIndex} {item.title}</li>
        {/each}
      </ul>
    </Card>
  </div>

  <CreateCarModal bind:openModal={showCreateCar} on:add={addCar} />
</div>

<style lang="scss">
  :global {
    .draggable-selected > .callout {
      background-color: rgba(255, 0, 0, 0.2);
    }
  }
</style>
