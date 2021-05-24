<script>
	import {createEventDispatcher} from "svelte"
	import FormGroup from "./FormGroup.svelte"

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

		dispatch("input", !multiple && files && files[0] || files)
	}
</script>

{#if $$slots.label}
	<FormGroup {id}>
		<slot slot="label" name="label" />
		<input
			bind:this={inputElement}
			class="form-control"
			type="file"
			{value}
			{name}
			{id}
			{placeholder}
			{pattern}
			{readonly}
			{multiple}
			on:input={onInput}
		>
	</FormGroup>
{:else}
	<FormGroup {id}>
		<input
			bind:this={inputElement}
			class="form-control"
			type="file"
			{value}
			{name}
			{id}
			{placeholder}
			{pattern}
			{readonly}
			on:input={onInput}
		>
	</FormGroup>
{/if}

