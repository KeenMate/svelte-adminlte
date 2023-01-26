<script>
	export let checked = false
	export let indeterminate = false
	export let id = ""
	export let value = ""
	export let name = ""
	export let disabled = false
	export let level = "primary"
</script>

<label class="icheck-{level} d-flex align-items-center {$$props.class || ''}">
	<input
		type="checkbox"
		bind:checked
		bind:indeterminate
		{id}
		{value}
		{name}
		{disabled}
		on:change
		on:click
		on:focusin
		on:focusout
	/>
	<slot />
</label>

<style lang="scss">
	label {
		gap: .25rem
	}
</style>
