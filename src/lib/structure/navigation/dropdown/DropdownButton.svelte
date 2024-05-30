<script lang="ts">
	export let href = null
</script>

<a
	class="nav-link dropdown-toggle"
	{href}
	id="navbarDropdown"
	role="button"
	data-toggle="dropdown"
	on:click
	{...$$restProps}
>
	<slot />
</a>
