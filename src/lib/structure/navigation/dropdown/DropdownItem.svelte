<script lang="ts">
	import useActions from "$lib/actions/use-actions.js"
	
	export let href: string | undefined = undefined
	export let active: boolean = false
	export let disabled: boolean = false
	export let use: ((node: HTMLElement) => any) | undefined = undefined
</script>

	<a
	{href}
	{...$$restProps}
	class="dropdown-item {$$restProps.class || ''}"
	class:active
	class:disabled
	use:useActions={use}
	on:click
>
	<slot />
</a>
