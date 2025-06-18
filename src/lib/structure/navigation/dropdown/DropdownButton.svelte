<script lang="ts">
	import useActions from "$lib/actions/use-actions.js"

	type Props = {
		href?: string | undefined;
		use?: ((node: HTMLElement) => any) | undefined;
		children?: import("svelte").Snippet;
		onClick?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    href    = undefined,
		    use     = undefined,
		    children,
		    onClick = undefined,
		    ...restProps
	    }: Props = $props()
</script>

<a
	id="navbarDropdown"
	{href}
	role="button"
	data-toggle="dropdown"
	{...restProps}
	class="nav-link dropdown-toggle {restProps.class || ''}"
	onclick={onClick}
	use:useActions={use}
>
	{@render children?.()}
</a>
