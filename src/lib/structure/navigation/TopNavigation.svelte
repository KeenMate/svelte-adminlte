<script lang="ts">
	import MobileNavToggle from "./MobileNavToggle.svelte"

	type Props = {
		hideMobileNavToggle?: boolean;
		left?: import("svelte").Snippet;
		children?: import("svelte").Snippet;
		right?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    hideMobileNavToggle = false,
		    left,
		    children,
		    right,
		    ...restProps
	    }: Props = $props()
</script>

<!-- Navbar -->
<nav class="main-header navbar navbar-expand navbar-white navbar-light {restProps.class || ''}">
	<!-- Left navbar links -->
	<ul class="navbar-nav">
		{#if !hideMobileNavToggle}
			<MobileNavToggle />
		{/if}

		{@render left?.()}
	</ul>

	{@render children?.()}

	<!-- Right navbar links -->
	<ul class="navbar-nav ml-auto">
		{@render right?.()}
	</ul>
</nav>
<!-- /.navbar -->
