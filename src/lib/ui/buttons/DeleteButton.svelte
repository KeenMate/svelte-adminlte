<script>
	import {_} from "svelte-i18n"
	import LteButton from "./LteButton.svelte"

	export let short = false
	export let xsmall = false
	export let small = false
	export let large = false

	$: noSizeSet = !xsmall && !small && !large
</script>

<LteButton
	color="danger"
	title={$_("common.buttons.delete")}
	{xsmall}
	small={small || noSizeSet}
	{large}
	{...$$restProps}
	on:click
>
	<slot>
		<i class="fas fa-trash fa-fw" />
		{#if !short}
			{$_("common.buttons.delete")}
		{/if}
	</slot>
</LteButton>
