<script>
	import {_} from "svelte-i18n"
	import LteButton from "./LteButton.svelte";
	import {Config} from "$lib/config.js";

	export let type = "submit"
	export let short = undefined
	export let xsmall = false
	export let small = false
	export let large = false

	$: noSizeSet = !xsmall && !small && !large

	$: buttonDefaults = $Config.defaults?.buttons?.options || {}
	$: specialButtonDefaults = $Config.defaults?.buttons?.saveButton || {} || {}
	$: computedShort = short === undefined
		? buttonDefaults.short
		|| specialButtonDefaults.short
		|| false
		: short
</script>

<LteButton
	{type}
	{xsmall}
	small={small || noSizeSet}
	{large}
	title={$_("common.buttons.save")}
	{...{...buttonDefaults, ...specialButtonDefaults, ...$$restProps}}
	on:click
>
	<slot>
		<i class="fas fa-save fa-fw" />
		{#if !computedShort}
			{$_("common.buttons.save")}
		{/if}
	</slot>
</LteButton>
