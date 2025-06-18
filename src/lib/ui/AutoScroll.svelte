<script lang="ts">
	type Props = {
		children?: import("svelte").Snippet;
	}

	let {children}: Props = $props()
</script>

<div class="auto-scroll">
	{@render children?.()}
</div>

<style lang="sass">
	.auto-scroll
		overflow: auto
</style>
