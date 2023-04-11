<script>
	import Inputmask from "inputmask"

	export let id = ""
	export let value = ""
	export let name = ""
	export let placeholder = ""
	/**
	 * @type {string?}
	 */
	export let pattern = null
	export let readonly = false
	export let plaintext = false
	export let disabled = false
	/**
	 * @type {string?}
	 */
	export let inputMask = null
	export let invalid = false
	/**
	 * @type {number?}
	 */
	export let maxlength = null
	/**
	 * @type {string?}
	 */
	export let size = null

	/**
	 * @type {HTMLInputElement?}
	 */
	export let inputElement = null

	export function isValid() {
		return inputElement?.validity.valid
	}

	$: inputMask && inputElement && Inputmask().mask(inputElement)
</script>

<input
	bind:this={inputElement}
	bind:value
	type="text"
	class:form-control={!plaintext}
	class:form-control-plaintext={plaintext}
	class:is-invalid={invalid}
	data-inputmask={inputMask || ""}
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
