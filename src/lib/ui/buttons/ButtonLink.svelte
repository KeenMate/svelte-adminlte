<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import useActions from "$lib/actions/use-actions.js"

	interface Props {
		href: string;
		target?: string | null;
		color?: string | null;
		toggle?: string | null;
		xsmall?: boolean;
		small?: boolean;
		large?: boolean;
		borderless?: boolean;
		outlined?: boolean;
		social?: boolean;
		link?: boolean;
		disabled?: boolean;
		app?: boolean;
		squared?: boolean;
		icon?: string | null;
		use?: ((node: HTMLElement) => any) | undefined;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		href,
		target = null,
		color = null,
		toggle = null,
		xsmall = false,
		small = false,
		large = false,
		borderless = false,
		outlined = false,
		social = false,
		link = false,
		disabled = false,
		app = false,
		squared = false,
		icon = null,
		use = undefined,
		children,
		...rest
	}: Props = $props();

	let buttonClass = $derived("btn-" + ((outlined && "outline-") || "") + (color || "default"))
</script>

<a
	{href}
	{target}
	class:btn-app={app}
	class:btn-flat={borderless}
	class:btn-lg={large}
	class:btn-link={link}
	class:btn-sm={small}
	class:btn-social={social}
	class:btn-xs={xsmall}
	class:disabled
	class:squared
	data-toggle={toggle || null}
	use:useActions={use}
	{...rest}
	class="btn btn-flat {!link ? buttonClass : ''} {rest.class || ''}"
	onclick={bubble('click')}
>
	{#if icon}
		<i class={icon}></i>
	{/if}
	{@render children?.()}
</a>

<style lang="scss">
	.squared {
		display: inline-flex;
		align-items: center;
		justify-content: center;

		width: 3rem;
		height: 3rem;
		padding: 0.1rem;

		&:hover {
			text-decoration: none;
		}
	}
</style>
