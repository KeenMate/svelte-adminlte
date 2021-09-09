<script>
  import { location, pop } from "svelte-spa-router";
  import { Routes } from "../../routes";
  import routeBreadcrumbs from "../../stores/route-breadcrumb";
  import routeTitle from "../../stores/route-title";
  import LteButton from "../ui/LteButton.svelte";

  // find current route by regex matching against route "map"
  // by replacing any route params (/foo/:param1/baz) with ^/foo/\w+/baz$
  $: currentRoute = Routes.find((x) => $location.match("^" + x.route.replace(/:\w+/, "\\w+") + "$"));

  $: breadcrumbs = $routeBreadcrumbs || (currentRoute && currentRoute.breadcrumb) || [];
  $: title = $routeTitle || (currentRoute && currentRoute.title) || "";

  function onRouteBack() {
    // const newRoute = popRoute()
    //
    // if (newRoute) {
    // 	console.log("New route is ", newRoute.location)
    // 	replace(`${newRoute.location}?${newRoute.querystring}`)
    // }

    pop();
  }
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

<!-- <div class="content-header">
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
</div> -->



<!-- <style lang="sass">
	.content-header
		display: flex
		align-items: center
		column-gap: .2rem

		h1
			flex: 1

		ol
			float: none
			position: static
</style> -->
