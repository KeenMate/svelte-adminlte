<script lang="ts">
	import {createEventDispatcher} from "svelte"

	type Props = {
		id?: string;
		value?: string;
		name?: string;
		multiple?: boolean;
		placeholder?: string;
		pattern?: string | null | undefined;
		readonly?: boolean;
		accept?: string | null | undefined;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    id          = "",
		    value       = $bindable(""),
		    name        = "",
		    multiple    = false,
		    placeholder = "",
		    pattern     = null,
		    readonly    = false,
		    accept      = null,
		    children,
		    ...restProps
	    }: Props = $props()

	const dispatch = createEventDispatcher()

	let inputElement: HTMLInputElement | null = $state(null)

	export function isValid() {
		return inputElement?.validity.valid
	}

	type InputEvent = Event & { currentTarget: EventTarget & HTMLInputElement }

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
		class="custom-file-input {restProps.class || ''}"
		oninput={onInput}
	/>
	<label class="custom-file-label" for={id}>
		{@render children?.()}
	</label>
</div>
