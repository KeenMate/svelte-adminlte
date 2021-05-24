<script>
	import {createEventDispatcher} from "svelte"

	export let checked = false

	const dispatch = createEventDispatcher()

	function onChange(ev) {
		dispatch("change", ev.target.checked)
	}
</script>

<div class="checkbox">
	<label>
		<input
			type="checkbox"
			{checked}
			on:change={onChange}
		>
		<slot />
	</label>
</div>
