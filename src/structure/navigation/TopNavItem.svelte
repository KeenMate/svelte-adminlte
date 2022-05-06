<script>
	export let href = "#"
	// export let icon;
</script>

<li class="nav-item d-none d-sm-inline-block">
	<a class="nav-link" {href} on:click>
		<!-- {#if icon}
			<i class="nav-icon {icon}" />
		{/if} -->

		<slot />
	</a>
</li>
