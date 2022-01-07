<script>
	import TableRowFullWidth from "./TableRowFullWidth.svelte"

	export let emptyRowText = "No item to show"
</script>

<TableRowFullWidth>
	<h5>{emptyRowText}</h5>
</TableRowFullWidth>
