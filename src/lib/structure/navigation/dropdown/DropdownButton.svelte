<script lang="ts">
	export let href = null
	export let isNavLink = false
</script>

<a
	{href}
	role="button"
	data-toggle="dropdown"
	{...$$restProps}
	class="dropdown-toggle {$$restProps.class || ''}"
	class:nav-link={isNavLink}
	class:dropdown-item={!isNavLink}
	on:click
>
	<slot />
</a>
