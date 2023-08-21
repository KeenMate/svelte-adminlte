<script>
	import {_} from "svelte-i18n"
	import LteButton from "./LteButton.svelte"

	export let xsmall = false
	export let small = false
	export let large = false

	$: noSizeSet = !xsmall && !small && !large
</script>

<LteButton
	color="danger"
	title={$_("common.buttons.delete")}
	xsmall={xsmall || noSizeSet}
	{small}
	{large}
	on:click
>
	<i class="fas fa-trash fa-fw" />
	<slot />
</LteButton>
