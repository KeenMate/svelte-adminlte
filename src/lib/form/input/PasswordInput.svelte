<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let id = ""
	export let value = ""
	export let name = ""
	export let placeholder = ""
	export let size
	export let disabled = false
	export let invalid = false

	export let inputElement = null
</script>

<input
	bind:this={inputElement}
	bind:value
	type="password"
	class="form-control form-control-{size || 'md'} {$$props.class || ''}"
	class:is-invalid={invalid}
	{id}
	{placeholder}
	{name}
	{disabled}
	on:change
	on:input
	on:keypress
	on:keydown
	on:keyup
	on:focusin
	on:focusout
/>
