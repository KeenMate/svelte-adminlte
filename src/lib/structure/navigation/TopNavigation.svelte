<script>
	import MobileNavToggle from "./MobileNavToggle.svelte"

	function logout() {
		// todo: make logout
		// window.location.replace(LogoutPath)
	}
</script>

<!-- Navbar -->
<nav class="main-header navbar navbar-expand navbar-white navbar-light {$$props.class || ''}">
	<!-- Left navbar links -->
	<ul class="navbar-nav">
		<MobileNavToggle />

		<slot name="left" />
	</ul>

	<slot />

	<!-- Right navbar links -->
	<ul class="navbar-nav ml-auto">
		<slot name="right" />
	</ul>
</nav>
<!-- /.navbar -->
