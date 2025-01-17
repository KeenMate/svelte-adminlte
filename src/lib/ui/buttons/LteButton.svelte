<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	interface Props {
		type?: "button" | "reset" | "submit" | null;
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
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		type = "button",
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
		children,
		...rest
	}: Props = $props();

	let buttonClass = $derived("btn-" + ((outlined && "outline-") || "") + (color || "default"))
</script>

<button
	class:btn-app={app}
	class:btn-flat={borderless}
	class:btn-lg={large}
	class:btn-link={link}
	class:btn-sm={small}
	class:btn-social={social}
	class:btn-xs={xsmall}
	class:disabled
	class:squared
	{type}
	data-toggle={toggle || null}
	{disabled}
	{...rest}
	class="btn btn-flat {!link ? buttonClass : ''} {rest.class || ''}"
	onclick={bubble('click')}
>
	{#if icon}
		<i class={icon}></i>
	{/if}
	<!-- note: the class attribute is after the {...$$restProps} on purpose -> to prevent static classes from being overriden -->
	{@render children?.()}
</button>

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
