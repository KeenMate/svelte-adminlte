<script>
	import {createEventDispatcher} from "svelte"

	export let id = ""
	export let type = "text"
	export let value = ""
	export let placeholder = ""
	export let readonly = false
	export let disabled = false
	export let hideLabel = false

	export let inputElement = null

	const dispatch = createEventDispatcher()

	function onInput(ev) {
		const value = ev.target.value

		dispatch("input", value)
	}
</script>

<div class="form-group">
	{#if $$slots.label && !hideLabel}
		<label for="{id}">
			<slot name="label" />
		</label>
	{/if}
	<div class="input-group">
		<input
			bind:this={inputElement}
			class="form-control input-sm"
			{value}
			{type}
			{id}
			{placeholder}
			{disabled}
			{readonly}
			on:input={onInput}
		>
		<slot />
		<!--{#if $$slots.postfix}-->
		<!--	<span class="input-group-btn">-->
		<!--    <slot name="postfix" />-->
		<!--  </span>-->
		<!--{/if}-->
	</div>
</div>

<style lang="sass">
	.input-group
		width: 100%
</style>
