<script lang="ts">
	interface Props {
		right?: boolean;
		large?: boolean;
		isSubmenu?: boolean;
		children?: import('svelte').Snippet;
	}

	let {
		right = false,
		large = false,
		isSubmenu = false,
		children
	}: Props = $props();
</script>

<div
	class="dropdown-{isSubmenu ? 'sub' : ''}menu"
	class:dropdown-menu-lg={large} class:dropdown-menu-right={right}
>
	{@render children?.()}
</div>
