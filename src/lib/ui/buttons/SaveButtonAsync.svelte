<script>
	import {_} from "svelte-i18n"
	import AsyncButton from "./AsyncButton.svelte"

	export let type = "submit"
	export let short = false
	export let xsmall = false
	export let small = false
	export let large = false

	$: noSizeSet = !xsmall && !small && !large
</script>

<AsyncButton
	{type}
	color="success"
	iconClass="fas fa-save"
	title={$_("common.buttons.save")}
	{xsmall}
	small={small || noSizeSet}
	{large}
	{...$$restProps}
	on:click
>
	<slot>
		{#if !short}
			{$_("common.buttons.save")}
		{/if}
	</slot>
</AsyncButton>
