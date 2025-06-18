<script lang="ts">
	import Inputmask from "inputmask"

	type Props = {
		id?: string;
		value?: string;
		name?: string;
		placeholder?: string;
		pattern?: any;
		readonly?: boolean;
		plaintext?: boolean;
		disabled?: boolean;
		inputMask?: any;
		invalid?: boolean;
		maxlength?: string;
		size: any;
		inputElement?: any;
		onChange?: (ev: Event) => void
		onInput?: (ev: Event) => void
		onKeypress?: (ev: Event) => void
		onFocusin?: (ev: Event) => void
		onFocusout?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    id           = "",
		    value        = $bindable(""),
		    name         = "",
		    placeholder  = "",
		    pattern      = null,
		    readonly     = false,
		    plaintext    = false,
		    disabled     = false,
		    inputMask    = null,
		    invalid      = false,
		    maxlength    = "",
		    size,
		    inputElement = $bindable(null),
		    onChange = undefined,
		    onInput = undefined,
		    onKeypress = undefined,
		    onFocusin = undefined,
		    onFocusout = undefined,
		    ...restProps
	    }: Props = $props()

	export function isValid() {
		return inputElement.validity.valid
	}

	run(() => {
		inputElement && Inputmask().mask(inputElement)
	})
</script>

<input
	bind:this={inputElement}
	bind:value
	type="tel"
	class="form-control-{size || 'md'} {restProps.class || ''}"
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
	onchange={onChange}
	oninput={onInput}
	onkeypress={onKeypress}
	onfocusin={onFocusin}
	onfocusout={onFocusout}
/>
