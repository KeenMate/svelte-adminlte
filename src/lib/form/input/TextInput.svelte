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
	export let maxlength = ""
	export let size = null

	export let inputElement = null

	export function isValid() {
		return inputElement.validity.valid
	}

	$: inputElement && Inputmask().mask(inputElement)
</script>

<input
	bind:this={inputElement}
	bind:value
	type="text"
	class:form-control={!plaintext}
	class:form-control-plaintext={plaintext}
	class:is-invalid={invalid}
	data-inputmask={inputMask || ''}
	{id}
	{maxlength}
	{name}
	{pattern}
	{placeholder}
	{disabled}
	{readonly}
	{...$$restProps}
	class="form-control-{size || 'md'} {$$restProps.class || ''}"
	on:change
	on:input
	on:keypress
	on:focusin
	on:focusout
/>
