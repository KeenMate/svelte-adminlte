<script lang="ts">
	import {_} from "svelte-i18n"
	import {Config} from "$lib/config.js"
	import LteButton from "$lib/ui/buttons/LteButton.svelte"

	export let short: boolean | undefined = undefined
	export let xsmall = false
	export let small  = false
	export let large  = false

	$: noSizeSet = !xsmall && !small && !large

	$: buttonDefaults = $Config.defaults?.buttons?.options || {}
	$: specialButtonDefaults = $Config.defaults?.buttons?.addButton || {} || {}
	$: iconClass = specialButtonDefaults.iconClass
	$: computedShort = short === undefined
		? specialButtonDefaults.short
		|| buttonDefaults.short
		|| false
		: short
</script>

<LteButton
	title={$_("common.buttons.add")}
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
			{$_("common.buttons.add")}
		{/if}
	</slot>
</LteButton>
