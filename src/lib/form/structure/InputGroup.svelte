<script lang="ts">
	type Props = {
		size?: string;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {size = "md", children, ...restProps}: Props = $props()
</script>

<div class="input-group input-group-{size} {restProps.class || ''}">
	{@render children?.()}
</div>

<style lang="sass">
	.input-group
		width: 100%
</style>
