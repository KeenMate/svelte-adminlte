<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let color = ""
</script>

<span
	{...$$restProps}
	class="badge {(color && 'bg-' + color) || ''} {$$props.classes || ''}"
	on:click
>
	<slot />
</span>
