<script>
	import {createEventDispatcher} from "svelte"
	import FormGroup from "./FormGroup.svelte"

	export let id = ""
	export let type = "text"
	export let value = ""
	export let name = ""
	export let placeholder = ""
	export let pattern = null
	export let readonly = false

	const dispatch = createEventDispatcher()

	export let inputElement = null

	export function isValid() {
		return inputElement.validity.valid
	}

	function onInput(ev) {
		const value = ev.target.value

		dispatch("input", value)
	}
</script>

{#if $$slots.label}
	<FormGroup {id}>
		<slot slot="label" name="label" />
		<input
			bind:this={inputElement}
			class="form-control"
			{value}
			{name}
			{type}
			{id}
			{placeholder}
			{pattern}
			{readonly}
			on:input={onInput}
			on:keypress
		>
	</FormGroup>
{:else}
	<FormGroup {id}>
		<input
			bind:this={inputElement}
			class="form-control"
			{value}
			{name}
			{type}
			{id}
			{placeholder}
			{pattern}
			{readonly}
			on:input={onInput}
			on:keypress}
		>
	</FormGroup>
{/if}
