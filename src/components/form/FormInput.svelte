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
	export let disabled = false
	export let hideLabel = false

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
	<FormGroup {id} {hideLabel}>
		<slot slot="label" name="label" />
		<input
			bind:this={inputElement}
			class="form-control input-sm"
			{value}
			{name}
			{type}
			{id}
			{placeholder}
			{pattern}
			{readonly}
			{disabled}
			on:input={onInput}
			on:keypress
		>
	</FormGroup>
{:else}
	<FormGroup {id} {hideLabel}>
		<input
			bind:this={inputElement}
			class="form-control input-sm"
			{value}
			{name}
			{type}
			{id}
			{placeholder}
			{pattern}
			{readonly}
			{disabled}
			on:input={onInput}
			on:keypress}
		>
	</FormGroup>
{/if}
