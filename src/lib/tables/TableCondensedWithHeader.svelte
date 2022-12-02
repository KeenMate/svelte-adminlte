<script>
	import {getKeysByPrefix} from "$lib/helpers/object-helpers.js"
	import TableCondensed from "$lib/tables/TableCondensed.svelte"
	import Card from "../structure/Card.svelte"

	$: cardProps = getKeysByPrefix($$props, "card")
	$: tableProps = getKeysByPrefix($$props, "table")
</script>

<Card {...cardProps}>
	{#if $$slots.fullHeader}
		<slot name="fullHeader" slot="fullHeader" />
	{/if}
	{#if $$slots.header}
		<slot name="header" slot="header" />
	{/if}
	{#if $$slots.tools}
		<slot name="tools" slot="tools" />
	{/if}
	<slot name="beforeTable" />

	<TableCondensed {...tableProps}>
		{#if $$slots.headers}
			<slot slot="headers" name="headers" />
		{/if}
		<slot />
		{#if $$slots.footer}
			<slot slot="footer" name="footer" />
		{/if}
	</TableCondensed>
	<slot name="afterTable" />
	<!-- /.card-body -->
</Card>
