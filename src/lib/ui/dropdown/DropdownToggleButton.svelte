<script lang="ts">
	import LteButton from "$lib/ui/buttons/LteButton.svelte"

	type Props = {
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {children, ...restProps}: Props = $props()
</script>

<LteButton
	{...restProps}
	class="dropdown-toggle dropdown-icon {restProps.class || ''}"
	data-toggle="dropdown"
>
	<span class="sr-only">
		{@render children?.()}
	</span>
</LteButton>
