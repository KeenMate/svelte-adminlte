<script lang="ts">
	type Props = {
		left?: boolean;
		right?: boolean;
		large?: boolean;
		isDropdownHover?: boolean;
		isSubmenu?: boolean;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    left            = false,
		    right           = false,
		    large           = false,
		    isDropdownHover = false,
		    isSubmenu       = false,
		    children,
		    ...restProps
	    }: Props = $props()
</script>

<ul
	class="dropdown-{isSubmenu ? 'sub' : ''}menu {restProps.class || ''}"
	class:dropdown-menu-lg={large}
	class:dropdown-menu-left={left}
	class:dropdown-menu-right={right}
	class:dropdown-hover={isDropdownHover}
>
	{@render children?.()}
</ul>
