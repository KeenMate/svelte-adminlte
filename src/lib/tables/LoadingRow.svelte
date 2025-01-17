<script lang="ts">
	import TableRowFullWidth from "./TableRowFullWidth.svelte"
	import Loader from "../ui/Loader.svelte"

	interface Props {
		minHeight?: number;
	}

	let { minHeight = 8 }: Props = $props();
</script>

<TableRowFullWidth>
	<Loader style="min-height: {minHeight}rem;" />
</TableRowFullWidth>
