<script lang="ts">
	import TopNavItem from "$lib/structure/navigation/TopNavItem.svelte"
	interface Props {
		[key: string]: any
	}

	let { ...rest }: Props = $props();
</script>

<TopNavItem
	href="javascript:void(0)"
	data-widget="pushmenu"
	role="button"
	{...rest}
	on:click
>
	<i class="fas fa-bars fa-fw"></i>
</TopNavItem>
