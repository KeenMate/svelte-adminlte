<script>
	export let href = "#"
	export let icon
</script>

<li class="nav-item">
	<a class="nav-link" {href}>
		{#if icon}
			<i class="nav-icon {icon}"></i>
		{/if}

		<slot />
	</a>
</li>
