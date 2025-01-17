<script lang="ts">
	export let left     = false
	export let right     = false
	export let large     = false
	export let isDropdownHover = false
	export let isSubmenu = false
</script>

<ul
	class="dropdown-{isSubmenu ? 'sub' : ''}menu {$$restProps.class || ''}"
	class:dropdown-menu-lg={large}
	class:dropdown-menu-left={left}
	class:dropdown-menu-right={right}
	class:dropdown-hover={isDropdownHover}
>
	<slot />
</ul>
