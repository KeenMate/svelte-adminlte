<script>
	import Router from "svelte-spa-router"

	import routes from "./routes"

	import darkTheme from "./stores/dark-theme"
	import currentUser from "./stores/current-user"

	import Navigation from "./components/structure/navigation/Navigation.svelte"
	import PageHeader from "./components/structure/PageHeader.svelte"
</script>

<div class="wrapper">
	<Navigation
		darkTheme={$darkTheme}
		displayName={$currentUser && $currentUser.display_name || "Neznámý"}
		on:toggleTheme={darkTheme.toggle}
	/>

	<div class="content-wrapper" class:bg-black={$darkTheme}>
		<PageHeader />
		<div class="content">
			<div class="container">
				<Router {routes} />
			</div>
		</div>
	</div>
</div>
