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
