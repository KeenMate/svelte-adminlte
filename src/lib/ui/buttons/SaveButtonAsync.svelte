<script lang="ts">
	import {_} from "svelte-i18n"
	import AsyncButton from "./AsyncButton.svelte"
	import {Config} from "$lib/config.js"

	type Props = {
		type?: string;
		short?: boolean | undefined;
		xsmall?: boolean;
		small?: boolean;
		large?: boolean;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    type   = "submit",
		    short  = undefined,
		    xsmall = false,
		    small  = false,
		    large  = false,
		    children,
		    ...restProps
	    }: Props = $props()

	let noSizeSet = $derived(!xsmall && !small && !large)

	let buttonDefaults        = $derived($Config.defaults?.buttons?.options || {})
	let specialButtonDefaults = $derived($Config.defaults?.buttons?.saveButton || {})
	let computedShort         = $derived(short === undefined
		? specialButtonDefaults.short
		|| buttonDefaults.short
		|| false
		: short)
</script>

<AsyncButton
	{type}
	title={$_("common.buttons.save")}
	{xsmall}
	small={small || noSizeSet}
	{large}
	{...{...buttonDefaults, ...specialButtonDefaults, ...restProps}}
>
	{#if children}{@render children()}{:else}
		{#if !computedShort}
			{$_("common.buttons.save")}
		{/if}
	{/if}
</AsyncButton>
