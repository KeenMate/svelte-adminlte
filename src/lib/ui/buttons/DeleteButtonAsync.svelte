<script>
	import {_} from "svelte-i18n"
	import AsyncButton from "./AsyncButton.svelte"
	import {Config} from "$lib/config.js"

	export let short = undefined
	export let xsmall = false
	export let small = false
	export let large = false

	$: noSizeSet = !xsmall && !small && !large

	$: buttonDefaults = $Config.defaults?.buttons?.options || {}
	$: specialButtonDefaults = $Config.defaults?.buttons?.deleteButton || {} || {}
	$: computedShort = short === undefined
		? buttonDefaults.short
		|| specialButtonDefaults.short
		|| false
		: short
</script>

<AsyncButton
	title={$_("common.buttons.delete")}
	{xsmall}
	small={small || noSizeSet}
	{large}
	{...{...buttonDefaults, ...specialButtonDefaults, ...$$restProps}}
	on:click
>
	<slot>
		{#if !computedShort}
			{$_("common.buttons.delete")}
		{/if}
	</slot>
</AsyncButton>
