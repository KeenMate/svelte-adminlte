<script>
	import TableRowFullWidth from "./TableRowFullWidth.svelte"

	export let errorText = "Couldn't load data"
</script>

<TableRowFullWidth>
	<h5 class="text-center">
		{errorText}
	</h5>
</TableRowFullWidth>
