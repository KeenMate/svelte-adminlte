<script lang="ts">
	interface Props {
		color?: string | null | undefined;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { color = undefined, children, ...rest }: Props = $props();
</script>

<h3
	{...rest}
	class="card-title {rest.class || ''}"
	style:--color={color}
>
	{@render children?.()}
</h3>

<style lang="scss">
	h3 {
		color: var(--color);
	}
</style>
