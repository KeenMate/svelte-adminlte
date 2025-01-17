<script lang="ts">
	import useActions from "$lib/actions/use-actions.js"

	export let href: string | undefined = undefined
	export let use: ((node: HTMLElement) => any) | undefined = undefined
</script>

<a
	{href}
	class="navbar-brand"
	use:useActions={use}
>
	<img
		src="/images/logo-ge-cp.svg"
		alt="Home"
		class="brand-image"
		style="opacity: .8"
		width="150"
	/>
</a>

<style lang="sass">
	a
		display: flex
		padding-top: 0
		padding-bottom: 0
</style>
