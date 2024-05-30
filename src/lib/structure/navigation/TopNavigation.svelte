<script lang="ts">
	import MobileNavToggle from "./MobileNavToggle.svelte"

	export let hideMobileNavToggle = false
</script>

<!-- Navbar -->
<nav class="main-header navbar navbar-expand navbar-white navbar-light {$$props.class || ''}">
	<!-- Left navbar links -->
	<ul class="navbar-nav">
		{#if !hideMobileNavToggle}
			<MobileNavToggle />
		{/if}

		<slot name="left" />
	</ul>

	<slot />

	<!-- Right navbar links -->
	<ul class="navbar-nav ml-auto">
		<slot name="right" />
	</ul>
</nav>
<!-- /.navbar -->
