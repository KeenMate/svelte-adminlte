<script lang="ts">
	import LteButton from "./LteButton.svelte"
	import {_} from "svelte-i18n"
	import {Config} from "$lib/config.js"

	export let short: boolean | undefined = undefined
	export let xsmall = false
	export let small = false
	export let large = false

	$: noSizeSet = !xsmall && !small && !large

	$: buttonDefaults = $Config.defaults?.buttons?.options || {}
	$: specialButtonDefaults = $Config.defaults?.buttons?.refreshButton || {}
	$: iconClass = specialButtonDefaults.iconClass
	$: computedShort = short === undefined
		? specialButtonDefaults.short
		|| buttonDefaults.short
		|| false
		: short
</script>

<LteButton
	title={$_("common.buttons.refresh")}
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
			{$_("common.buttons.refresh")}
		{/if}
	</slot>
</LteButton>
