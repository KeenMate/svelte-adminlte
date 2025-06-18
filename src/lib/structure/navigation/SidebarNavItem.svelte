<script lang="ts">
	import useActions from "$lib/actions/use-actions.js"

	type Props = {
		href?: string | null;
		iconClass?: string | null;
		active?: boolean;
		tooltip?: string | null;
		target?: string | null;
		use?: ((node: HTMLElement) => any) | undefined;
		icon?: import("svelte").Snippet;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    href      = "#",
		    iconClass = null,
		    active    = false,
		    tooltip   = "",
		    target    = "",
		    use       = undefined,
		    icon,
		    children,
		    ...restProps
	    }: Props = $props()
</script>

<li class="nav-item" data-toggle="tooltip" data-placement="right" title={tooltip}>
	<a
		class="nav-link"
		class:active
		{href}
		{target}
		{...restProps}
		use:useActions={use}
	>
		{#if iconClass}
			<i class="nav-icon {iconClass}"></i>
		{:else}
			{@render icon?.()}
		{/if}

		{@render children?.()}
	</a>
</li>
