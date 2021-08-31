<script>
	import MobileNavToggle from "./MobileNavToggle.svelte"
	import BrandNavLogoSidebar from "./BrandNavLogoSidebar.svelte"
	import UserDropdownMenu from "./UserDropdownMenu.svelte"

	function logout() {
		// todo: make logout
		// window.location.replace(LogoutPath)
	}
</script>

<header class="main-header">
	<MobileNavToggle />
	<nav class="navbar navbar-static-top">
		<BrandNavLogoSidebar />

		<div class="navbar-custom-menu">
			<ul class="nav navbar-nav">
				<UserDropdownMenu on:logout={logout} />
			</ul>
		</div>
	</nav>
</header>
