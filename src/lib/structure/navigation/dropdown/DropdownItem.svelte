<script>
	export let href = '#';
	export let active = false;
	export let disabled = false;
</script>

<a class="dropdown-item" class:active class:disabled {href} on:click {...$$restProps}>
	<slot />
</a>
