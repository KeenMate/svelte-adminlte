<script>
	import {createEventDispatcher} from "svelte"

	export let id = ""

	const dispatch = createEventDispatcher()

	function onInput(ev) {
		const value = ev.target.value

		dispatch("input", value)
	}
</script>

<div class="form-group">
	{#if $$slots.label}
		<label for="{id}">
			<slot name="label" />
		</label>
	{/if}
	<slot />
</div>
