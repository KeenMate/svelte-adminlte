<script lang="ts">
	import {_} from "svelte-i18n"
	import AsyncButton from "./AsyncButton.svelte"
	import {Config} from "$lib/config.js"

	type Props = {
		short?: boolean | undefined;
		xsmall?: boolean;
		small?: boolean;
		large?: boolean;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    short  = undefined,
		    xsmall = false,
		    small  = false,
		    large  = false,
		    children,
		    ...restProps
	    }: Props = $props()

	let noSizeSet = $derived(!xsmall && !small && !large)

	let buttonDefaults        = $derived($Config.defaults?.buttons?.options || {})
	let specialButtonDefaults = $derived($Config.defaults?.buttons?.deleteButton || {})
	let computedShort         = $derived(short === undefined
		? specialButtonDefaults.short
		|| buttonDefaults.short
		|| false
		: short)
</script>

<AsyncButton
	title={$_("common.buttons.delete")}
	{xsmall}
	small={small || noSizeSet}
	{large}
	{...{...buttonDefaults, ...specialButtonDefaults, ...restProps}}
	on:click
>
	{#if children}{@render children()}{:else}
		{#if !computedShort}
			{$_("common.buttons.delete")}
		{/if}
	{/if}
</AsyncButton>
