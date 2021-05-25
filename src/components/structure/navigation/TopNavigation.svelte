<script>
	import {createEventDispatcher} from "svelte"
	import MobileNavToggle from "./MobileNavToggle.svelte"
	import BrandNavLogoSidebar from "./BrandNavLogoSidebar.svelte"
	import UserDropdownMenu from "./UserDropdownMenu.svelte"


	export let darkTheme = false
	export let displayName = ""

	// let darkThemeCounter = 1
	const dispatch = createEventDispatcher()

	function logout() {
		alert("Do the logout")
		// window.location.replace(LogoutPath)
	}
</script>

<header class="main-header">
	<BrandNavLogoSidebar />
	<nav class="navbar navbar-static-top">
		<MobileNavToggle />

		<div class="navbar-custom-menu">
			<ul class="nav navbar-nav">
				<UserDropdownMenu
					{displayName}
					{darkTheme}
					on:toggleTheme
					on:logout={logout}
				/>
			</ul>
		</div>
	</nav>
</header>
