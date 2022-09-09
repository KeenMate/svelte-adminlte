<script>
	import {setContext} from "svelte"
	import {writable} from "svelte/store"

	export let key
	export let id

	let currentEntry = writable(null)

	setContext(key, {
		currentEntry,
		id
	})
</script>

<div class="accordion" {id}>
	<slot />
</div>
