<script>
	import TableEmptyRow from "./TableEmptyRow.svelte"
	import Card from "../structure/Card.svelte"
</script>

<Card {...$$restProps}>
	<slot name="header" slot="header" />
	<slot name="tools" slot="tools" />
	<slot name="beforeTable" />
	<table class="table table-condensed">
		<thead>
		<slot name="headers" />
		</thead>
		<tbody>
		<slot>
			<TableEmptyRow />
		</slot>
		</tbody>
	</table>
	<!-- /.card-body -->
</Card>
