<script>
	import {createEventDispatcher} from "svelte"

	export let checked = false
	export let title = ""

	const dispatch = createEventDispatcher()

	function onClick(ev) {
		setTimeout(() => {
			dispatch("change", ev.target.checked)
			ev.target.checked = !ev.target.checked
		}, 0)
	}

	function onKeydown(ev) {
		if (!["Enter", " "].includes(ev.keyCode))
			return
		dispatch("change", !ev.target.checked)
	}
</script>

<!--<label>-->
<!--	<div class="icheckbox">-->
<!--		<input type="checkbox">-->
<!--	</div>-->
<!--	<slot />-->
<!--</label>-->

<div class="checkbox {$$props.class || ''}">
	<label>
		<input
			type="checkbox"
			{checked}
			{title}
			on:click={onClick}
			on:keydown={onKeydown}
		>
		<slot />
	</label>
</div>

<!--<style lang="sass">-->
<!--	.checkbox label-->
<!--		margin-bottom: 10px-->
<!--</style>-->
