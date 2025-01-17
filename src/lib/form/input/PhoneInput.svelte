<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
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
	export let size

	export let inputElement = null

	export function isValid() {
		return inputElement.validity.valid
	}

	$: inputElement && Inputmask().mask(inputElement)
</script>

<input
	bind:this={inputElement}
	bind:value
	type="tel"
	class="form-control-{size || 'md'} {$$props.class || ''}"
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
	on:change
	on:input
	on:keypress
	on:focusin
	on:focusout
/>
