<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<span class="context-menu-label">
	{@render children?.()}
</span>

<style lang="sass">
		:global
			.context-menu-label
				padding: .5rem 1rem
				color: #828282
				font-weight: lighter
</style>
