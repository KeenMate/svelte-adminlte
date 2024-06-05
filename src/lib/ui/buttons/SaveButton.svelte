<script lang="ts">
	import {_} from "svelte-i18n"
	import LteButton from "./LteButton.svelte"
	import {Config} from "$lib/config.js"

	export let type: "submit" | "button" | "reset" | null | undefined   = "submit"
	export let short: boolean | undefined = undefined
	export let xsmall = false
	export let small  = false
	export let large  = false

	$: noSizeSet = !xsmall && !small && !large

	$: buttonDefaults = $Config.defaults?.buttons?.options || {}
	$: specialButtonDefaults = $Config.defaults?.buttons?.saveButton || {} || {}
	$: iconClass = specialButtonDefaults.iconClass
	$: computedShort = short === undefined
		? specialButtonDefaults.short
		|| buttonDefaults.short
		|| false
		: short
</script>

<LteButton
	{type}
	title={$_("common.buttons.save")}
	{xsmall}
	small={small || noSizeSet}
	{large}
	{...{...buttonDefaults, ...specialButtonDefaults, ...$$restProps}}
	on:click
>
	<slot>
		{#if iconClass}
			<i class={iconClass} />
		{/if}
		{#if !computedShort}
			{$_("common.buttons.save")}
		{/if}
	</slot>
</LteButton>
