<script lang="ts">
	import useActions from "$lib/actions/use-actions.js"

	export let href: string | undefined = undefined
	export let use: ((node: HTMLElement) => any) | undefined = undefined
</script>

<a
	id="navbarDropdown"
	{href}
	role="button"
	class="nav-link dropdown-toggle"
	data-toggle="dropdown"
	use:useActions={use}
	{...$$restProps}
	on:click
>
	<slot />
</a>
