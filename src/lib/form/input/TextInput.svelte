<script lang="ts">
	import { run, createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import Inputmask from "inputmask"
	import {getValidityClass} from "../../helpers/class-helpers.js"


	interface Props {
		id?: string;
		value?: string;
		name?: string;
		placeholder?: string;
		pattern?: string | null;
		readonly?: boolean;
		plaintext?: boolean;
		disabled?: boolean;
		inputMask?: string | null;
		invalid?: boolean;
		maxlength?: number | null;
		size?: string;
		validity?: string;
		inputElement?: HTMLInputElement | null;
		[key: string]: any
	}

	let {
		id = "",
		value = $bindable(""),
		name = "",
		placeholder = "",
		pattern = null,
		readonly = false,
		plaintext = false,
		disabled = false,
		inputMask = null,
		invalid = false,
		maxlength = null,
		size = "md",
		validity = "none",
		inputElement = $bindable(null),
		...rest
	}: Props = $props();

	export function isValid() {
		return inputElement?.validity.valid
	}

	//@ts-ignore
	run(() => {
		inputMask && inputElement && Inputmask().mask(inputElement)
	});
</script>
<input
	bind:this={inputElement}
	bind:value
	type="text"
	class:form-control={!plaintext}
	class:form-control-plaintext={plaintext}
	class:is-invalid={invalid}
	data-inputmask={inputMask || ""}
	{id}
	{maxlength}
	{name}
	{pattern}
	{placeholder}
	{disabled}
	{readonly}
	{...rest}
	class="form-control-{size || 'md'} {rest.class || ''} {getValidityClass(validity)}"
	onchange={bubble('change')}
	oninput={bubble('input')}
	onkeypress={bubble('keypress')}
	onkeydown={bubble('keydown')}
	onkeyup={bubble('keyup')}
	onfocusin={bubble('focusin')}
	onfocusout={bubble('focusout')}
/>
