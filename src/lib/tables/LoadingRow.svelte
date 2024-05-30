<script lang="ts">
	import TableRowFullWidth from "./TableRowFullWidth.svelte"
	import Loader from "../ui/Loader.svelte"

	export let minHeight = 8
</script>

<TableRowFullWidth>
	<Loader style="min-height: {minHeight}rem;" />
</TableRowFullWidth>
