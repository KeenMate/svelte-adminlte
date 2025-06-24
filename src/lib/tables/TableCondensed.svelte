<script lang="ts">
	let {
		    node     = $bindable(),
		    headers  = undefined,
		    children = undefined,
		    footer   = undefined,
		    ...restProps
	    } = $props()
</script>

<table bind:this={node} {...restProps} class="table table-sm data-table {restProps.class || ''}">
	{#if headers}
		<thead>
		{@render headers?.()}
		</thead>
	{/if}
	<tbody>
	{@render children?.()}
	</tbody>
	{#if footer}
		<tfoot>
		{@render footer?.()}
		</tfoot>
	{/if}
</table>
