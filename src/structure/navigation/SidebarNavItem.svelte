<script>
	export let href = "#"
	export let icon
	export let active = false
</script>

<li class="nav-item">
	<a
		class="nav-link"
		class:active
		{href}
	>
		{#if icon}
			<i class="nav-icon {icon}"></i>
		{/if}

		<slot />
	</a>
</li>
