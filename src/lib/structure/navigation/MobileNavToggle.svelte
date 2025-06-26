<script lang="ts">
	import TopNavItem from "$lib/structure/navigation/TopNavItem.svelte"

	type Props = {
		[key: string]: any
	}

	let {...restProps}: Props = $props()
</script>

<TopNavItem
	href="javascript:void(0)"
	data-widget="pushmenu"
	role="button"
	{...restProps}
>
	<i class="fas fa-bars fa-fw"></i>
</TopNavItem>
