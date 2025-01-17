<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	import Inputmask from "inputmask"

	export let id = ""
	/**
	 * @type {number?}
	 */
	export let value = null
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
	 * @type {string?}
	 */
	export let size = "md"
	export let min = ""
	export let max = ""

	/**
	 * @type {HTMLInputElement?}
	 */
	export let inputElement = null

	export function isValid() {
		return inputElement?.validity.valid
	}

	// @ts-ignore
	$: inputElement && Inputmask().mask(inputElement)
</script>

<input
	bind:this={inputElement}
	bind:value
	class="form-control-{size} {$$props.class || ''}"
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
	on:keydown
	on:keyup
	on:focusin
	on:focusout
/>
