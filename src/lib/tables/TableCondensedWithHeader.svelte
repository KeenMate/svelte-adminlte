<script>
	import {getKeysByPrefix} from "$lib/helpers/object-helpers.js"
	import TableCondensed from "$lib/tables/TableCondensed.svelte"
	import Card from "../structure/Card.svelte"

	$: cardProps = getKeysByPrefix($$props, "card")
	$: tableProps = getKeysByPrefix($$props, "table")
</script>

<Card {...cardProps}>
	<slot name="header" slot="header" />
	<slot name="tools" slot="tools" />
	<slot name="beforeTable" />

	<TableCondensed {...tableProps}>
		<slot slot="headers" name="headers" />
		<slot />
		<slot slot="footer" name="footer" />
	</TableCondensed>
	<slot name="afterTable" />
	<!-- /.card-body -->
</Card>
