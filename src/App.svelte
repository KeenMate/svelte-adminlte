<script>
	import {onMount} from "svelte"
	import {get} from "svelte/store"
	import Router from "svelte-spa-router"

	import routes from "./routes"

	import darkTheme from "./stores/dark-theme"
	import currentUser from "./stores/current-user"
	import sidebarOpenState from "./stores/sidebar-open-state"

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

	function applySidebarOpenState() {
		if (!get(sidebarOpenState)) {
			document.body.classList.add("sidebar-collapse", "sidebar-mini-expand-feature")
			document.body.classList.remove("sidebar-mini-expand-feature")
		}
	}

	onMount(() => {
		applySidebarOpenState()
	})
</script>

<div class="wrapper">
	<TopNavigation
		darkTheme={$darkTheme}
		displayName={$currentUser && $currentUser.display_name || "Unknown"}
		on:toggleTheme={darkTheme.toggle}
	/>
	<Sidebar />

	<div class="content-wrapper">
		<PageHeader />
		<div class="content">
			<Router {routes} />
		</div>
	</div>
</div>
