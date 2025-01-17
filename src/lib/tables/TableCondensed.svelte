<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let node = undefined
</script>

<table bind:this={node} {...$$restProps} class="table table-sm data-table {$$props.class || ''}">
	<thead>
	<slot name="headers" />
	</thead>
	<tbody>
	<slot />
	</tbody>
	<slot name="footer" />
</table>
