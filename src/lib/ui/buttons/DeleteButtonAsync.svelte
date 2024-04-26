<script>
	import {_} from "svelte-i18n"
	import AsyncButton from "./AsyncButton.svelte"

	export let short = false
	export let xsmall = false
	export let small = false
	export let large = false

	$: noSizeSet = !xsmall && !small && !large
</script>

<AsyncButton
	color="danger"
	iconClass="fas fa-trash"
	title={$_("common.buttons.delete")}
	{xsmall}
	small={small || noSizeSet}
	{large}
	{...$$restProps}
	on:click
>
	<slot>
		{#if !short}
			{$_("common.buttons.delete")}
		{/if}
	</slot>
</AsyncButton>
