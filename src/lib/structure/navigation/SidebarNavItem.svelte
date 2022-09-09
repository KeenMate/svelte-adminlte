<script>
	export let href = "#"
	export let icon
	export let active = false
	export let tooltip = ""
</script>

<li class="nav-item" data-toggle="tooltip" data-placement="right" title={tooltip}>
	<a class="nav-link" class:active {href}>
		{#if icon}
			<i class="nav-icon {icon}" />
		{/if}

		<slot />
	</a>
</li>
