<script lang="ts">
	type Props = {
		/**
		 * @deprecated Use native `title` prop
		 */
		tooltip?: string;
		children?: import("svelte").Snippet;
		onClick?: (ev: Event) => void

		[key: string]: any
	}

	let {
		tooltip = "",
		    children,
		    onClick = undefined,
		    ...restProps
	}: Props = $props()
</script>

<a
	role="button"
	title={tooltip}
	{...restProps}
	class="dropdown-item {restProps.class || ''}"
	onclick={onClick}
>
	{@render children?.()}
</a>

<style lang="sass">
	li
		&:hover
			cursor: pointer
</style>
