<script>
	// this, in fact, is not a LTE component (I just could not think of a different name :))

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let checked = false;
	export let checkedClass = '';
	export let uncheckedClass = '';
	export let disabledClass = '';
	export let disabled = false;

	$: sliderClasses = disabled ? disabledClass : checked ? checkedClass : uncheckedClass;

	function change() {
		dispatch('change', !checked);
		if (!checked) {
			dispatch('checked', !checked);
		} else {
			dispatch('unchecked', !checked);
		}
	}
</script>

<label class="switch">
	<input bind:checked type="checkbox" {disabled} on:change={change} />
	<span class="slider {sliderClasses}" />
</label>

<style lang="sass">
	.switch
		position: relative
		display: inline-block
		width: 3rem
		height: 1.5rem
		margin: 0 !important

		input
			opacity: 0
			width: 0
			height: 0

	.slider
		position: absolute
		cursor: pointer
		top: 0
		left: 0
		right: 0
		bottom: 0
		background-color: #ccc
		border-radius: 5px

		&:before
			position: absolute
			content: ""
			height: 1.2rem
			width: 1.2rem
			left: .15rem
			bottom: .15rem
			background-color: white
			-webkit-transition: 0.1s
			transition: 0.1s
			border-radius: 3px

	input:checked + .slider
		//background-color: #2196f3
		//box-shadow: 0 0 1px #2196f3

		&:before
			-webkit-transform: translateX(1.5rem)
			-ms-transform: translateX(1.5rem)
			transform: translateX(1.5rem)
</style>
