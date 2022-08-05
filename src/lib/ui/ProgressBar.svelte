<script>
	export let lower
	export let higher

	let progressElement

	$: percentage = Math.round((lower / higher) * 100)
	$: percentageColor = `hsl(${((percentage / 100) * 120) + 25}deg, 100%, 53%)`
	$: progressElement && setProgressBackgroundColor(percentageColor, percentage)

	function setProgressBackgroundColor(valueColor, valuePercentage) {
		progressElement.style.background = `linear-gradient(90deg, ${valueColor} ${valuePercentage}%, hsl(0, 0%, 90%) ${valuePercentage}%)`
	}
</script>

<div bind:this={progressElement} class="custom-progress">
	<span class="text">
		{lower} / {higher} ({percentage}%)
	</span>
</div>

<style lang="sass">
	.custom-progress
		display: inline-flex
		height: 1.5rem
		justify-content: center
		align-items: center
		width: 100%
		padding: .5rem 1rem
		border-radius: .2em

		.text
			white-space: nowrap


</style>
