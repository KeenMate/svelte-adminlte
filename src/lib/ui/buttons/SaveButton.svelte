<script>
	import {_} from "svelte-i18n"
	import LteButton from "./LteButton.svelte";

	export let type = "submit"
	export let short = false
	export let xsmall = false
	export let small = false
	export let large = false

	$: noSizeSet = !xsmall && !small && !large
</script>

<LteButton
	color="success"
	{type}
	{xsmall}
	small={small || noSizeSet}
	{large}
	title={$_("common.buttons.save")}
	{...$$restProps}
	on:click
>
	<slot>
		<i class="fas fa-save fa-fw" />
		{#if !short}
			{$_("common.buttons.save")}
		{/if}
	</slot>
</LteButton>
