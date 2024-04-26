<script>
	import AsyncButton from "./AsyncButton.svelte"
	import {_} from "svelte-i18n"

	export let short = false
	export let xsmall = false
	export let small = false
	export let large = false

	$: noSizeSet = !xsmall && !small && !large
</script>

<AsyncButton
	color="success"
	iconClass="fas fa-sync"
	title={$_("common.buttons.refresh")}
	{xsmall}
	small={small || noSizeSet}
	{large}
	{...$$restProps}
	on:click
>
	<slot>
		{#if !short}
			{$_("common.buttons.refresh")}
		{/if}
	</slot>
</AsyncButton>
