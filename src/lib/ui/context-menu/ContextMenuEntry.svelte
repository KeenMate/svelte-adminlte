<script lang="ts">
	type Props = {
		color?: any;
		children?: import("svelte").Snippet;
		onClick?: (ev: Event) => void
		onMouseenter?: (ev: Event) => void
		onMouseleave?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    color        = null,
		    children,
		    onClick      = undefined,
		    onMouseenter = undefined,
		    onMouseleave = undefined,
		    ...restProps
	    }: Props = $props()
</script>

<div
	class="context-menu-entry {color || ''} {restProps.class || ''}"
	onclick={onClick}
	onmouseenter={onMouseenter}
	onmouseleave={onMouseleave}
>
	{@render children?.()}
</div>
