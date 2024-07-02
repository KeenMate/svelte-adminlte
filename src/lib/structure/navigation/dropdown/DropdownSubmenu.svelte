<script lang="ts">
	export let left     = false
	export let right     = false
	export let large     = false
	export let isDropdownHover = false
</script>

<li
	{...$$restProps}
	class="dropdown-submenu {$$restProps.class || ''}"
	class:dropdown-menu-lg={large}
	class:dropdown-menu-left={left}
	class:dropdown-menu-right={right}
	class:dropdown-hover={isDropdownHover}
>
	<slot />
</li>
