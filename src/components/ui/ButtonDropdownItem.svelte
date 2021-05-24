<script>
	import {createEventDispatcher} from "svelte"

	const dispatch = createEventDispatcher()

	export let tooltip = ""
</script>

<li title={tooltip} on:click={() => dispatch("click")}>
	<a>
		<slot />
	</a>
</li>

<style lang="sass">
	li
		&:hover
			cursor: pointer
</style>
