<script lang="ts">
	import useActions from "$lib/actions/use-actions.js"

	export let href: string | undefined = undefined
	export let use: ((node: HTMLElement) => any) | undefined = undefined
</script>

<a
	{href}
	class="logo"
	use:useActions={use}
>
	<img src="/images/logo-ge-cp.svg" alt="Home" style="opacity: .8" width="200" />
</a>

<style lang="sass">
	a
		display: flex
		align-items: center
		padding-top: 0
		padding-bottom: 0

		img, span
			//flex: 1
			max-height: 50px
</style>
