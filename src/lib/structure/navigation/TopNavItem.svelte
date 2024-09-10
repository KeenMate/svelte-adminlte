<script lang="ts">
	import useActions from "$lib/actions/use-actions.js"
	
	export let href: string | null = null
	export let visibility = "d-none d-sm-inline-block"
	export let use: ((node: HTMLElement) => any) | undefined = undefined
</script>

<li
	{...$$restProps}
	class="nav-item {visibility} {$$props.class || ''}"
>
	<a
		{href}
		class="nav-link"
		use:useActions={use}
		on:click
	>
		<slot />
	</a>
</li>

<style lang="scss">
	.nav-link {
		line-height: 1.5rem;
	}
</style>
