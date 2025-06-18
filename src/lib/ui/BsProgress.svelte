<script lang="ts">

	type Props = {
		value?: number;
		min?: number;
		max?: number;
		color?: string;
	}

	let {
		    value = 0,
		    min   = 0,
		    max   = 100,
		    color = "default"
	    }: Props = $props()
</script>

<div class="progress">
	<div
		class="progress-bar progress-bar-{color}"
		role="progressbar"
		style="width: {value}%"
		aria-valuemax={max}
		aria-valuemin={min}
		aria-valuenow={value}
	></div>
</div>

<style lang="sass">
	.progress
		margin-bottom: 0
</style>
