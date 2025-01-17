<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let checked = false
	export let indeterminate = false
	export let id = ""
	export let value = ""
	export let name = ""
	export let disabled = false
</script>

<div class="{$$props.class || ''}">
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
	<label for={id}>
		<slot />
	</label>
</div>

<style lang="scss">
	label {
		gap: 0.25rem;
	}
</style>
