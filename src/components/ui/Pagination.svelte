<script>
	import {createEventDispatcher} from "svelte"

	const dispatch = createEventDispatcher()

	function onPrevClick() {
		dispatch("prevClick")
	}

	function onNextClick() {
		dispatch("nextClick")
	}
</script>

<ul class="pagination pagination-sm inline">
	<li on:click={onPrevClick}>
		<a>«</a>
	</li>
	<slot />
	<li on:click={onNextClick}>
		<a>»</a>
	</li>
</ul>
