<script>
	export let href = null
	export let active = false
	export let disabled = false
</script>

<a class="dropdown-item" class:active class:disabled {href} on:click {...$$restProps}>
	<slot />
</a>
