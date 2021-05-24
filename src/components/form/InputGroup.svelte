<script>
	import {createEventDispatcher} from "svelte"
	
	export let id = ""
	export let type = "text"
	export let value = ""
	export let placeholder = ""
	export let readonly = false

	const dispatch = createEventDispatcher()

	function onInput(ev) {
		const value = ev.target.value

		dispatch("input", value)
	}
</script>

<div class="input-group">
	<input 
	class="form-control"
	{value}
	{type}
	{id}
	{placeholder}
	{readonly}
	on:input={onInput}>
	{#if $$slots.postfix}
		<span class="input-group-btn">
	    <slot name="postfix" />
	  </span>
	{/if}
</div>
