<script lang="ts">
	import {_} from "svelte-i18n"
	import AsyncButton from "./AsyncButton.svelte"
	import {Config} from "$lib/config.js"

	export let type   = "submit"
	export let short: boolean | undefined = undefined
	export let xsmall = false
	export let small  = false
	export let large  = false

	$: noSizeSet = !xsmall && !small && !large

	$: buttonDefaults = $Config.defaults?.buttons?.options || {}
	$: specialButtonDefaults = $Config.defaults?.buttons?.saveButton || {} || {}
	$: computedShort = short === undefined
		? buttonDefaults.short
		|| specialButtonDefaults.short
		|| false
		: short
</script>

<AsyncButton
	{type}
	title={$_("common.buttons.save")}
	{xsmall}
	small={small || noSizeSet}
	{large}
	{...{...buttonDefaults, ...specialButtonDefaults, ...$$restProps}}
	on:click
>
	<slot>
		{#if !computedShort}
			{$_("common.buttons.save")}
		{/if}
	</slot>
</AsyncButton>
