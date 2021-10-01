<script>
  export let title;
  export let breadcrumbs;
  export let currentRoute;
</script>

{#if currentRoute}
  <div class="content-header">
    <div class="container-fluid">
      <div class="row mb-2">
        <div class="col-sm-6">
          <!-- {#if $location !== "/"}
            <LteButton small link squared color="" on:click={onRouteBack}>
              <i class="fas fa-arrow-left" />
            </LteButton>
          {/if} -->
          <h1>
            {title}
          </h1>
        </div>

        {#if breadcrumbs && breadcrumbs.length}
          <div class="col-sm-6">
            <ol class="breadcrumb float-sm-right">
              {#each breadcrumbs as breadcrumb, i}
                <li class="breadcrumb-item" class:active={currentRoute.breadcrumb - 1 === i}>
                  {breadcrumb}
                </li>
              {/each}
            </ol>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<div class="content-header">
  <div class="container-fluid">
    <div class="row mb-2">
      <div class="col-sm-6">
        <h1 class="m-0 text-dark">
          Dashboard
          <small>Control panel</small>
        </h1>
      </div>
      <div class="col-sm-6">
        <ol class="breadcrumb float-sm-right">
          <li class="breadcrumb-item"><a href="#">Home</a></li>
          <li class="breadcrumb-item active">Dashboard v1</li>
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
