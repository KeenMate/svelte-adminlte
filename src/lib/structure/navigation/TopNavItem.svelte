<script lang="ts">
	import useActions from "$lib/actions/use-actions.js"

	type Props = {
		href?: string | null;
		visibility?: string;
		use?: ((node: HTMLElement) => any) | undefined;
		children?: import("svelte").Snippet;
		onClick?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    href       = null,
		    visibility = "d-none d-sm-inline-block",
		    use        = undefined,
		    children,
		    onClick = undefined,
		    ...restProps
	    }: Props = $props()
</script>

<li
	{...restProps}
	class="nav-item {visibility} {restProps.class || ''}"
>
	<a
		{href}
		class="nav-link"
		use:useActions={use}
		onclick={onClick}
	>
		{@render children?.()}
	</a>
</li>

<style lang="scss">
	.nav-link {
		line-height: 1.5rem;
	}
</style>
