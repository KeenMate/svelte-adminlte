<script lang="ts">
	import useActions from "$lib/actions/use-actions.js"

	type Props = {
		active?: boolean;
		use?: ((node: HTMLElement) => any) | undefined;
		children?: import("svelte").Snippet;
		onClick?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    active = false,
		    use = undefined,
		    children,
		    onClick = undefined,
		    ...restProps
	}: Props = $props()
</script>

<li class="nav-item {restProps.class || ''}" role="presentation" onclick={onClick}>
	<!-- svelte-ignore a11y_invalid_attribute -->
	<!-- eslint-disable-next-line -->
	<a
		href="javascript:void(0)"
		class:active
		use:useActions={use}
		{...restProps}
		class="nav-link {restProps.linkClass || ''}"
	>
		{@render children?.()}
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
