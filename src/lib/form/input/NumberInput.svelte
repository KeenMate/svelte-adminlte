<!-- @migration-task Error while migrating Svelte code: Unexpected token
https://svelte.dev/e/js_parse_error -->
https://svelte.dev/e/js_parse_error -->
<script lang="ts">
	import Inputmask from "inputmask"
	
	type Props = {
		id?: string;
		value?: number | null | undefined
		name?: string;
		placeholder?: string;
		pattern?: string | null | undefined
		readonly?: boolean;
		plaintext?: boolean;
		disabled?: boolean;
		inputMask?: string | null | undefined
		invalid?: boolean;
		size?: string | null | undefined
		min?: string;
		max?: string;
		inputElement?: HTMLInputElement | null | undefined
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
		    id           = "",
		    value        = $bindable(null),
		    name         = "",
		    placeholder  = "",
		    pattern      = null,
		    readonly     = false,
		    plaintext    = false,
		    disabled     = false,
		    inputMask    = null,
		    invalid      = false,
		    size         = "md",
		    min          = "",
		    max          = "",
		    inputElement = $bindable(null),
		    onChange = undefined,
		    onInput = undefined,
		    onKeypress = undefined,
		    onKeydown = undefined,
		    onKeyup = undefined,
		    onFocusin = undefined,
		    onFocusout = undefined,
		    ...restProps
	    }: Props = $props()

	export function isValid() {
		return inputElement?.validity.valid
	}

	// @ts-ignore
	run(() => {
		inputElement && Inputmask().mask(inputElement)
	})
</script>

<input
	bind:this={inputElement}
	bind:value
	class="form-control-{size} {restProps.class || ''}"
	class:form-control={!plaintext}
	class:form-control-plaintext={plaintext}
	class:is-invalid={invalid}
	data-inputmask={inputMask || ""}
	type="number"
	{disabled}
	{id}
	{max}
	{min}
	{name}
	{pattern}
	{placeholder}
	{readonly}
	onchange={onChange}
	oninput={onInput}
	onkeypress={onKeypress}
	onkeydown={onKeydown}
	onkeyup={onKeyup}
	onfocusin={onFocusin}
	onfocusout={onFocusout}
/>
