<script lang="ts">
	import {_} from "svelte-i18n"
	import LteButton from "./LteButton.svelte"
	import {Config} from "$lib/config.js"

	interface Props {
		type?: "submit" | "button" | "reset" | null | undefined;
		short?: boolean | undefined;
		xsmall?: boolean;
		small?: boolean;
		large?: boolean;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let {
		type = "submit",
		short = undefined,
		xsmall = false,
		small = false,
		large = false,
		children,
		...rest
	}: Props = $props();

	let noSizeSet = $derived(!xsmall && !small && !large)

	let buttonDefaults = $derived($Config.defaults?.buttons?.options || {})
	let specialButtonDefaults = $derived($Config.defaults?.buttons?.saveButton || {})
	let iconClass = $derived(specialButtonDefaults.iconClass)
	let computedShort = $derived(short === undefined
		? specialButtonDefaults.short
		|| buttonDefaults.short
		|| false
		: short)
</script>

<LteButton
	{type}
	title={$_("common.buttons.save")}
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
			{$_("common.buttons.save")}
		{/if}
	{/if}
</LteButton>
