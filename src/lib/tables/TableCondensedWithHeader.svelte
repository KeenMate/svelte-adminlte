<script lang="ts">
	import {getKeysByPrefix} from "$lib/helpers/object-helpers.js"
	import TableCondensed from "$lib/tables/TableCondensed.svelte"
	import Card from "../structure/Card.svelte"
	interface Props {
		fullHeader?: import('svelte').Snippet;
		header?: import('svelte').Snippet;
		tools?: import('svelte').Snippet;
		beforeTable?: import('svelte').Snippet;
		headers?: import('svelte').Snippet;
		children?: import('svelte').Snippet;
		footer?: import('svelte').Snippet;
		afterTable?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		...props
	}: Props = $props();

	let cardProps = $derived(getKeysByPrefix(props, "card"))
	let tableProps = $derived(getKeysByPrefix(props, "table"))

	const fullHeader_render = $derived(fullHeader);
	const header_render = $derived(header);
	const tools_render = $derived(tools);
	const headers_render = $derived(headers);
	const footer_render = $derived(footer);
</script>

<Card {...cardProps}>
	{#snippet fullHeader()}
		{@render props.fullHeader_render?.()}
	{/snippet}
	{#snippet header()}
		{@render props.header_render?.()}
	{/snippet}
	{#snippet tools()}
		{@render props.tools_render?.()}
	{/snippet}
	{@render props.beforeTable?.()}

	<TableCondensed {...tableProps}>
		{#snippet headers()}
				{@render props.headers_render?.()}
			{/snippet}
		{@render props.children?.()}
		{#snippet footer()}
				{@render props.footer_render?.()}
			{/snippet}
	</TableCondensed>
	{@render props.afterTable?.()}
	<!-- /.card-body -->
</Card>
