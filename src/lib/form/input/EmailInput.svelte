<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let id = ""
	export let value = ""
	export let name = ""
	export let placeholder = ""
	export let pattern = null
	export let readonly = false
	export let plaintext = false
	export let disabled = false
	export let size

	export let inputElement = null

	export function isValid() {
		return inputElement.validity.valid
	}
</script>

<input
	bind:this={inputElement}
	bind:value
	type="email"
	class="form-control-{size || 'md'} {$$props.class || ''}"
	class:form-control={!plaintext}
	class:form-control-plaintext={plaintext}
	{id}
	{name}
	{pattern}
	{placeholder}
	{readonly}
	{disabled}
	on:change
	on:input
	on:keypress
	on:keydown
	on:keyup
	on:focusin
	on:focusout
/>
