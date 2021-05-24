<script>
	export let value = 0
	export let min = 0
	export let max = 100

	export let color = "default"
</script>

<div class="progress">
	<div class="progress-bar progress-bar-{color}"
		role="progressbar"
		aria-valuenow={value}
		aria-valuemin={min}
		aria-valuemax={max}
		style="width: {value}%">
	</div>
</div>

<style lang="sass">
	.progress
		margin-bottom: 0
</style>
