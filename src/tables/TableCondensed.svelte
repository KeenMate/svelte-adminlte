<script>
	import TableEmptyRow from "./TableEmptyRow.svelte"
</script>

<table class="table table-sm data-table {$$props.class || ''}">
	<thead>
	<slot name="headers" />
	</thead>
	<tbody>
	<slot>
		<TableEmptyRow />
	</slot>
	</tbody>
	<slot name="footer"></slot>
</table>
