<script lang="ts">
	import { run } from 'svelte/legacy';

	interface Props {
		lower: number;
		higher: number;
	}

	let { lower, higher }: Props = $props();

	let progressElement: HTMLDivElement = $state()


	function setProgressBackgroundColor(valueColor: string, valuePercentage: number) {
		progressElement.style.background = `linear-gradient(90deg, ${valueColor} ${valuePercentage}%, hsl(0, 0%, 90%) ${valuePercentage}%)`
	}
	let percentage = $derived(Math.round((lower / higher) * 100))
	let percentageColor = $derived(`hsl(${(percentage / 100) * 120 + 25}deg, 100%, 53%)`)
	run(() => {
		progressElement && setProgressBackgroundColor(percentageColor, percentage)
	});
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
