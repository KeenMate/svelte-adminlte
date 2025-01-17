<script lang="ts">
	import LteButton from "$lib/ui/buttons/LteButton.svelte"
	interface Props {
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { children, ...rest }: Props = $props();
</script>

<LteButton
	{...rest}
	class="dropdown-toggle dropdown-icon {rest.class || ''}"
	data-toggle="dropdown"
>
	<span class="sr-only">
		{@render children?.()}
	</span>
</LteButton>
