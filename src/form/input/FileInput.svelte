<script>
	import {createEventDispatcher} from "svelte"

	export let id = ""
	export let value = ""
	export let name = ""
	export let multiple = false
	export let placeholder = ""
	export let pattern = null
	export let readonly = false

	const dispatch = createEventDispatcher()

	let inputElement = null

	export function isValid() {
		return inputElement.validity.valid
	}

	function onInput(ev) {
		const files = ev.target.files

		dispatch("input", (!multiple && files && files[0]) || files)
	}
</script>

<div class="custom-file">
	<input
		bind:this={inputElement}
		bind:value
		class="custom-file-input {$$props.class || ''}"
		{id}
		{multiple}
		{name}
		on:input={onInput}
		{pattern}
		{placeholder}
		{readonly}
		type="file"
	/>
	<label class="custom-file-label" for={id}>
		<slot />
	</label>
</div>
