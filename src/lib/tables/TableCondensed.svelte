<script lang="ts">
	let {
		    node = $bindable(),
		    headers,
		    children,
		    footer,
		    ...restProps
	    } = $props()
</script>

<table bind:this={node} {...restProps} class="table table-sm data-table {restProps.class || ''}">
	<thead>
	{@render headers?.()}
	</thead>
	<tbody>
	{@render children?.()}
	</tbody>
	{@render footer?.()}
</table>
