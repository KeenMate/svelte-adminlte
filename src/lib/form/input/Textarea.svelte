<script>
	export let id = ""
	export let value = ""
	export let name = ""
	export let rows = 2
	export let cols = ""
	export let placeholder = ""
	/**
	 * @type {string?}
	 */
	export let pattern = null
	export let readonly = false
	export let plaintext = false
	export let disabled = false
	/**
	 * @type {number?}
	 */
	export let maxlength = null
	/**
	 * @type {string?}
	 */
	export let size

	/**
	 * @type {HTMLTextAreaElement?}
	 */
	let inputElement = null

	export function isValid() {
		return inputElement?.validity.valid
	}
</script>

<textarea
	bind:this={inputElement}
	bind:value
	class:form-control={!plaintext}
	class:form-control-plaintext={plaintext}
	class:set-cols={cols}
	{id}
	{maxlength}
	{name}
	{pattern}
	{placeholder}
	{rows}
	{cols}
	{readonly}
	{disabled}
	{...$$restProps}
	class="form-control-{size || 'md'} {$$restProps.class || ''}"
	on:change
	on:input
	on:keypress
	on:focusin
	on:focusout
/>

<style>
	.set-cols {
		width: auto;
	}
</style>
