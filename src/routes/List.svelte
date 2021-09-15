<script>
  import { sortBy } from "lodash";
  import { Sortable, Plugins } from "@shopify/draggable";
  import { Card, Callout, LteButton } from "../components";
  import CreateCarModal from "../controls/list/CreateCarModal.svelte";

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

  $: {
    if (list) {
      sortable = new Sortable(list, {
        draggable: ".draggable-callout",
        mirror: {
          // appendTo: containerSelector,
          constrainDimensions: true,
        },
        swapAnimation: {
          duration: 200,
          easingFunction: "ease-in-out",
          horizontal: false,
        },
        plugins: [Plugins.SwapAnimation],
      });

      sortable.on("sortable:stop", handleDragStop);
    }
  }

  function handleDragStop(event) {
    let oldIndex = event.data.oldIndex;
    let newIndex = event.data.newIndex;

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
        {#each items as item}
          <Callout class="draggable-callout" color="info">{item.title}</Callout>
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

  <CreateCarModal bind:openModal={showCreateCar} on:add={({ detail: d }) => console.log("received new car", d)} />
</div>
