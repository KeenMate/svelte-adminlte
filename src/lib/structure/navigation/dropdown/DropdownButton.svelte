<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import useActions from "$lib/actions/use-actions.js"

	interface Props {
		href?: string | undefined;
		use?: ((node: HTMLElement) => any) | undefined;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { href = undefined, use = undefined, children, ...rest }: Props = $props();
</script>

<a
	id="navbarDropdown"
	{href}
	role="button"
	class="nav-link dropdown-toggle"
	data-toggle="dropdown"
	use:useActions={use}
	{...rest}
	onclick={bubble('click')}
>
	{@render children?.()}
</a>
