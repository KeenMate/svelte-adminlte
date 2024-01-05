<script>
	import LteButton from "./LteButton.svelte"

	export let xsmall = false
	export let small = false
	export let large = false

	$: noSizeSet = !xsmall && !small && !large
</script>

<LteButton
	color="info"
	{xsmall}
	small={small || noSizeSet}
	{large}
	on:click
>
	<i class="fas fa-sync fa-fw" />
</LteButton>
