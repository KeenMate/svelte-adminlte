<script>
	import {location, pop} from "svelte-spa-router"
	import {Routes} from "../../routes"
	import routeBreadcrumbs from "../../stores/route-breadcrumb"
	import routeTitle from "../../stores/route-title"
	import LteButton from "../ui/LteButton.svelte"

	// let title = ""

	// find current route by regex matching against route "map"
	// by replacing any route params (/foo/:param1/baz) with ^/foo/\w+/baz$
	$: currentRoute = Routes.find(x => $location.match("^" + x.route.replace(/:\w+/, "\\w+") + "$"))

	$: breadcrumbs = $routeBreadcrumbs || (currentRoute && currentRoute.breadcrumb) || []
	$: title = $routeTitle || (currentRoute && currentRoute.title) || ""

	// $: title = typeof currentRoute.title === "function"
	// 	&& currentRoute.title()
	// 	|| currentRoute.title

	function noRouteBack() {
		pop()
	}
</script>

{#if currentRoute}
	<div class="container">
		<!-- Content Header (Page header) -->
		<section class="content-header">
			{#if $location !== "/"}
				<LteButton small link squared color="" on:click={noRouteBack}>
					<i class="fas fa-arrow-left"></i>
				</LteButton>
			{/if}
			<h1>
				{title}
			</h1>
			{#if breadcrumbs && breadcrumbs.length}
				<ol class="breadcrumb">
					{#each breadcrumbs as breadcrumb, i}
						<li class:active={currentRoute.breadcrumb - 1 === i}>
							{breadcrumb}
						</li>
					{/each}
				</ol>
			{/if}
		</section>
	</div>
{/if}

<style lang="sass">
	.content-header
		display: flex
		align-items: center
		column-gap: .2rem

		padding-left: 0

		h1
			flex: 1

		ol
			float: none
			position: static
</style>
