<script>
	export let tooltip = ""
</script>

<a role="button" class="dropdown-item" title={tooltip} on:click>
	<slot />
</a>

<style lang="sass">
	li
		&:hover
			cursor: pointer
</style>
