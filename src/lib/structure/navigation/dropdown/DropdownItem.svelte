<script lang="ts">
	import useActions from "$lib/actions/use-actions.js"

	type Props = {
		href?: string | undefined;
		active?: boolean;
		disabled?: boolean;
		use?: ((node: HTMLElement) => any) | undefined;
		children?: import("svelte").Snippet;
		onClick?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    href     = undefined,
		    active   = false,
		    disabled = false,
		    use      = undefined,
		    children,
		    onClick = undefined,
		    ...restProps
	    }: Props = $props()
</script>

<a
	{href}
	{...restProps}
	class="dropdown-item {restProps.class || ''}"
	class:active
	class:disabled
	use:useActions={use}
	onclick={bubble('click')}
>
	{@render children?.()}
</a>
