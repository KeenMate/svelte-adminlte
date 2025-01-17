<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let id = null
	export let value = null
	export let min = null
	export let max = null
</script>

<input
	bind:value
	type="range"
	class="custom-range {$$props.class || ''}"
	{id}
	{min}
	{max}
	on:input
	on:change
	on:focus
	on:blur
/>
