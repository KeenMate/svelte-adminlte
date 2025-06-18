<script lang="ts">
	type Props = {
		color?: string | null | undefined;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {color = undefined, children, ...restProps}: Props = $props()
</script>

<h3
	{...restProps}
	class="card-title {restProps.class || ''}"
	style:--color={color}
>
	{@render children?.()}
</h3>

<style lang="scss">
	h3 {
		color: var(--color);
	}
</style>
