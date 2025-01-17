<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let checked = false
	export let group = null
	export let indeterminate = false
	export let id = ""
	export let value = ""
	export let name = ""
	export let disabled = false
	export let level = "primary"
	
	$: classContainsFlex = $$restProps.class?.split(" ").some((x: string) => /flex/.test(x)) || false
</script>

<div
	{...$$restProps}
	class="icheck-{level} {classContainsFlex ? '' : 'd-flex align-items-center'} {$$props.class || ''}"
>
	<input
		type="checkbox"
		{checked}
		{indeterminate}
		{id}
		{group}
		{value}
		{name}
		{disabled}
		on:change
		on:click
		on:focusin
		on:focusout
	>
	<label for={id}>
		<slot />
	</label>
</div>

<style lang="scss">
	label {
		gap: 0.25rem;
	}
</style>
