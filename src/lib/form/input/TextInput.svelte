<script lang="ts">
	import Inputmask from "inputmask"

	export let id = ""
	export let value = ""
	export let name = ""
	export let placeholder = ""
	export let pattern: string | null = null
	export let readonly = false
	export let plaintext = false
	export let disabled = false
	export let inputMask: string | null = null
	export let invalid = false
	export let maxlength: number | null = null
	export let size = "md"

	export let inputElement: HTMLInputElement | null = null

	export function isValid() {
		return inputElement?.validity.valid
	}

	//@ts-ignore
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
	on:keydown
	on:keyup
	on:focusin
	on:focusout
/>
