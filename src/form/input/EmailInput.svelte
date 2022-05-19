<script>
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
	bind:value={value}
	type="email"
	class="form-control-{size || 'md'} {$$props.class || ''}"
	class:form-control={!plaintext}
	class:form-control-plaintext={plaintext}
	{disabled}
	{id}
	{name}
	on:change
	on:input
	on:keypress
	{pattern}
	{placeholder}
	{readonly}
/>
