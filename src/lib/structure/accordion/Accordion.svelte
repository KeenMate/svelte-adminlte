<script lang="ts">
	import {setContext} from "svelte"
	import {writable} from "svelte/store"

	let { key, id, children } = $props();

	let currentEntry = writable(null)

	setContext(key, {
		currentEntry,
		id
	})
</script>

<div class="accordion" {id}>
	{@render children?.()}
</div>
