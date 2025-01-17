<script lang="ts">
	import useActions from "$lib/actions/use-actions.js"
	
	export let active: boolean = false
	export let use: ((node: HTMLElement) => any) | undefined = undefined
</script>

<li class="nav-item {$$props.class || ''}" role="presentation" on:click>
	<!-- svelte-ignore a11y-invalid-attribute -->
	<!-- eslint-disable-next-line -->
	<a
		href="javascript:void(0)"
		class="nav-link"
		class:active
		use:useActions={use}
		{...$$restProps}
	>
		<slot />
	</a>
</li>

<!-- <style lang="sass">
	li[role="presentation"]
		//border-radius: 0
		border: 1px solid #ddd

		&.active
			border-bottom-color: #f9f9f9 !important

		a
			//background-color: #00c0ef
			border: none
			border-radius: 0
			padding: .5rem
			margin-right: 0px

</style> -->
