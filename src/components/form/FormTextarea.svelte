<script>
	import {createEventDispatcher} from "svelte"
	import FormGroup from "./FormGroup.svelte"

	export let id = ""
	export let value = ""
	export let name = ""
	export let rows = 2
	export let placeholder = ""
	export let pattern = null
	export let readonly = false
	export let disabled = false
	export let hideLabel = false

	const dispatch = createEventDispatcher()

	let inputElement = null

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
		<textarea
			bind:this={inputElement}
			class="form-control input-sm"
			{rows}
			{value}
			{name}
			{id}
			{placeholder}
			{pattern}
			{readonly}
			{disabled}
			on:input={onInput}
		></textarea>
	</FormGroup>
{:else}
	<FormGroup {id}>
		<textarea
			bind:this={inputElement}
			class="form-control input-sm"
			{rows}
			{value}
			{name}
			{id}
			{placeholder}
			{pattern}
			{readonly}
			{disabled}
			on:input={onInput}
		></textarea>
	</FormGroup>
{/if}
