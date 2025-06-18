<script lang="ts">
	type Props = {
		left?: boolean;
		right?: boolean;
		large?: boolean;
		isDropdownHover?: boolean;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    left            = false,
		    right           = false,
		    large           = false,
		    isDropdownHover = false,
		    children,
		    ...restProps
	    }: Props = $props()
</script>

<li
	{...restProps}
	class="dropdown-submenu {restProps.class || ''}"
	class:dropdown-menu-lg={large}
	class:dropdown-menu-left={left}
	class:dropdown-menu-right={right}
	class:dropdown-hover={isDropdownHover}
>
	{@render children?.()}
</li>
