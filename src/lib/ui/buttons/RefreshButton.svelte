<script lang="ts">
	import LteButton from "./LteButton.svelte"
	import {_} from "svelte-i18n"
	import {Config} from "$lib/config.js"

	interface Props {
		short?: boolean | undefined;
		xsmall?: boolean;
		small?: boolean;
		large?: boolean;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		short = undefined,
		xsmall = false,
		small = false,
		large = false,
		children,
		...rest
	}: Props = $props();

	let noSizeSet = $derived(!xsmall && !small && !large)

	let buttonDefaults = $derived($Config.defaults?.buttons?.options || {})
	let specialButtonDefaults = $derived($Config.defaults?.buttons?.refreshButton || {})
	let iconClass = $derived(specialButtonDefaults.iconClass)
	let computedShort = $derived(short === undefined
		? specialButtonDefaults.short
		|| buttonDefaults.short
		|| false
		: short)
</script>

<LteButton
	title={$_("common.buttons.refresh")}
	{xsmall}
	small={small || noSizeSet}
	{large}
	{...{...buttonDefaults, ...specialButtonDefaults, ...rest}}
	on:click
>
	{#if children}{@render children()}{:else}
		{#if iconClass}
			<i class={iconClass}></i>
		{/if}
		{#if !computedShort}
			{$_("common.buttons.refresh")}
		{/if}
	{/if}
</LteButton>
