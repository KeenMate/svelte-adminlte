<script lang="ts">
	type Props = {
		color?: string;
		children?: import("svelte").Snippet;
		onClick?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    color   = "",
		    children,
		    onClick = undefined,
		    ...restProps
	    }: Props = $props()
</script>

<span
	{...restProps}
	class="badge {(color && 'bg-' + color) || ''} {restProps.class || ''}"
	onclick={onClick}
>
	{@render children?.()}
</span>
