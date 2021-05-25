<script>
	import Router from "svelte-spa-router"

	import routes from "./routes"

	import darkTheme from "./stores/dark-theme"
	import currentUser from "./stores/current-user"

	import TopNavigation from "./components/structure/navigation/TopNavigation.svelte"
	import PageHeader from "./components/structure/PageHeader.svelte"
	import Sidebar from "./components/structure/navigation/Sidebar.svelte"

	$: if ($darkTheme) {
		document.body.classList.remove("skin-black")
		document.body.classList.add("skin-midnight")
	} else {
		document.body.classList.remove("skin-midnight")
		document.body.classList.add("skin-black")
	}
</script>

<div class="wrapper">
	<TopNavigation
		darkTheme={$darkTheme}
		displayName={$currentUser && $currentUser.display_name || "Neznámý"}
		on:toggleTheme={darkTheme.toggle}
	/>
	<Sidebar />

	<div class="content-wrapper" class:bg-black={$darkTheme}>
		<PageHeader />
		<div class="content">
			<Router {routes} />
		</div>
	</div>
</div>
