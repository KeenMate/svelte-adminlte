<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	interface Props {
		tooltip?: string;
		children?: import('svelte').Snippet;
	}

	let { tooltip = "", children }: Props = $props();
</script>

<a role="button" class="dropdown-item" title={tooltip} onclick={bubble('click')}>
	{@render children?.()}
</a>

<style lang="sass">
	li
		&:hover
			cursor: pointer
</style>
