<script lang="ts">
	type Props = {
		children?: import("svelte").Snippet;
	}

	let {children}: Props = $props()
</script>

<div class="narrow-column-container">
	{@render children?.()}
</div>

<style lang="sass">
	:global
		.narrow-column-container
			display: flex
			column-gap: .5rem

			& > *:not(.small)
				flex: 1
</style>
