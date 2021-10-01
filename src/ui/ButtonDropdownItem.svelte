<script>
	export let tooltip = ""
</script>

<li title={tooltip} on:click>
	<a>
		<slot />
	</a>
</li>

<style lang="sass">
	li
		&:hover
			cursor: pointer
</style>
