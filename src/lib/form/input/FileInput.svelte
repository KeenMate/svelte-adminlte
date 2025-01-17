<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	import {createEventDispatcher} from "svelte"

	export let id = ""
	export let value = ""
	export let name = ""
	export let multiple = false
	export let placeholder = ""
	export let pattern: string | null | undefined = null
	export let readonly = false
	export let accept: string | null | undefined = null

	const dispatch = createEventDispatcher()

	let inputElement: HTMLInputElement | null = null

	export function isValid() {
		return inputElement?.validity.valid
	}

	type InputEvent = Event & {currentTarget: EventTarget & HTMLInputElement}

	function onInput(ev: InputEvent) {
		const files = (ev.target as HTMLInputElement)?.files

		dispatch("input", (!multiple && files && files[0]) || files)
	}
</script>

<div class="custom-file">
	<input
		bind:this={inputElement}
		bind:value
		{id}
		{multiple}
		{name}
		{pattern}
		{placeholder}
		{readonly}
		{accept}
		type="file"
		class="custom-file-input {$$props.class || ''}"
		on:input={onInput}
	/>
	<label class="custom-file-label" for={id}>
		<slot />
	</label>
</div>
