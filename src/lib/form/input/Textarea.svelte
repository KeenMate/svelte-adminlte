<!-- @migration-task Error while migrating Svelte code: Unexpected token
https://svelte.dev/e/js_parse_error -->
<script lang="ts">
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	
	
	
	interface Props {
		id?: string;
		value?: string;
		name?: string;
		rows?: number;
		cols?: string;
		placeholder?: string;
		pattern?: string?;
		readonly?: boolean;
		plaintext?: boolean;
		disabled?: boolean;
		maxlength?: number?;
		size?: string?;
		[key: string]: any
	}

	let {
		id = "",
		value = $bindable(""),
		name = "",
		rows = 2,
		cols = "",
		placeholder = "",
		pattern = null,
		readonly = false,
		plaintext = false,
		disabled = false,
		maxlength = null,
		size = null,
		...rest
	}: Props = $props();

	/**
	 * @type {HTMLTextAreaElement?}
	 */
	let inputElement = $state(null)

	export function isValid() {
		return inputElement?.validity.valid
	}
</script>

<textarea
	bind:this={inputElement}
	bind:value
	class:form-control={!plaintext}
	class:form-control-plaintext={plaintext}
	class:set-cols={cols}
	{id}
	{maxlength}
	{name}
	{pattern}
	{placeholder}
	{rows}
	{cols}
	{readonly}
	{disabled}
	{...rest}
	class="form-control-{size || 'md'} {rest.class || ''}"
	onchange={bubble('change')}
	oninput={bubble('input')}
	onkeypress={bubble('keypress')}
	onkeydown={bubble('keydown')}
	onkeyup={bubble('keyup')}
	onfocusin={bubble('focusin')}
	onfocusout={bubble('focusout')}
></textarea>

<style>
	.set-cols {
		width: auto;
	}
</style>
