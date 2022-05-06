<script>
	import Inputmask from "inputmask"

	export let id = ""
	export let value = ""
	export let name = ""
	export let placeholder = ""
	export let pattern = null
	export let readonly = false
	export let plaintext = false
	export let disabled = false
	export let inputMask = null
	export let invalid = false
	export let size
	export let min = ""
	export let max = ""

	export let inputElement = null

	export function isValid() {
		return inputElement.validity.valid
	}

	$: inputElement && Inputmask().mask(inputElement)
</script>

<input
	bind:this={inputElement}
	bind:value
	class="form-control-{size || 'md'} {$$props.class || ''}"
	class:form-control={!plaintext}
	class:form-control-plaintext={plaintext}
	class:is-invalid={invalid}
	data-inputmask={inputMask || ""}
	type="number"
	{disabled}
	{id}
	{max}
	{min}
	{name}
	{pattern}
	{placeholder}
	{readonly}
	on:change
	on:input
	on:keypress
/>
