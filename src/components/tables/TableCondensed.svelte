<script>
	import TableEmptyRow from "./TableEmptyRow.svelte"
	import Box from "../structure/Card.svelte"

	export let cssClass = ""
</script>

<!--<Box>-->
<!--	<slot name="beforeTable" />-->
<table class="table table-condensed data-table {cssClass}">
	<thead>
	<slot name="headers" />
	</thead>
	<tbody>
	<slot>
		<TableEmptyRow />
	</slot>
	</tbody>
</table>
<!--</Box>-->
