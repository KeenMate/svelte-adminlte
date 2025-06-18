https://svelte.dev/e/js_parse_error -->
<script lang="ts">
	type Props = {
		id?: string;
		value?: string;
		name?: string;
		rows?: number;
		cols?: string;
		placeholder?: string;
		pattern?: string;
		readonly?: boolean;
		plaintext?: boolean;
		disabled?: boolean;
		maxlength?: number;
		size?: string;
		onChange?: (ev: Event) => void
		onInput?: (ev: Event) => void
		onKeypress?: (ev: Event) => void
		onKeydown?: (ev: Event) => void
		onKeyup?: (ev: Event) => void
		onFocusin?: (ev: Event) => void
		onFocusout?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    id          = "",
		    value       = $bindable(""),
		    name        = "",
		    rows        = 2,
		    cols        = "",
		    placeholder = "",
		    pattern     = null,
		    readonly    = false,
		    plaintext   = false,
		    disabled    = false,
		    maxlength   = null,
		    size        = null,
		    onChange = undefined,
		    onInput = undefined,
		    onKeypress = undefined,
		    onKeydown = undefined,
		    onKeyup = undefined,
		    onFocusin = undefined,
		    onFocusout = undefined,
		    ...restProps
	    }: Props = $props()

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
	{...restProps}
	class="form-control-{size || 'md'} {restProps.class || ''}"
	onchange={onChange}
	oninput={onInput}
	onkeypress={onKeypress}
	onkeydown={onKeydown}
	onkeyup={onKeyup}
	onfocusin={onFocusin}
	onfocusout={onFocusout}
></textarea>

<style>
	.set-cols {
		width: auto;
	}
</style>
