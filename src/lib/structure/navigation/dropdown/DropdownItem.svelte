<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import useActions from "$lib/actions/use-actions.js"
	
	interface Props {
		href?: string | undefined;
		active?: boolean;
		disabled?: boolean;
		use?: ((node: HTMLElement) => any) | undefined;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		href = undefined,
		active = false,
		disabled = false,
		use = undefined,
		children,
		...rest
	}: Props = $props();
</script>

<a
	{href}
	class="dropdown-item"
	class:active
	class:disabled
	use:useActions={use}
	{...rest}
	onclick={bubble('click')}
>
	{@render children?.()}
</a>
