<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	interface Props {
		color?: any;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { color = null, children, ...rest }: Props = $props();
</script>

<div
	class="context-menu-entry {color || ''} {rest.class || ''}"
	onclick={bubble('click')}
	onmouseenter={bubble('mouseenter')}
	onmouseleave={bubble('mouseleave')}
>
	{@render children?.()}
</div>
