<script>
  import { createEventDispatcher } from "svelte";
  import LteButton from "../ui/LteButton.svelte";

  const dispatch = createEventDispatcher();

  export let showBackArrow = false;

  function backArrowClicked(event) {
    dispatch("backArrowClicked", event.detail);
  }
</script>

<div class="content-header">
  <div class="container-fluid">
    <div class="row mb-2">
      <div class="col-sm-6">
        {#if showBackArrow}
          <LteButton small link squared color="" on:click={backArrowClicked}>
            <i class="fas fa-arrow-left" />
          </LteButton>
        {/if}
        <h1>
          <slot />
        </h1>
      </div>

      <div class="col-sm-6">
        <ol class="breadcrumb float-sm-right">
          <slot name="breadcrumbs" />
        </ol>
      </div>
    </div>
  </div>
</div>

<style lang="sass">
	.content-header
		display: flex
		align-items: center
		column-gap: .2rem

		h1
			flex: 1

		ol
			float: none
			position: static
</style>
