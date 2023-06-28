<script>
	export let href = null
	export let icon
	export let active = false
	export let tooltip = ""
	export let target = ""
</script>

<li class="nav-item" data-toggle="tooltip" data-placement="right" title={tooltip}>
	<a class="nav-link" class:active {href} {target}>
		{#if icon}
			<i class="nav-icon {icon}" />
		{/if}

		<slot />
	</a>
</li>
