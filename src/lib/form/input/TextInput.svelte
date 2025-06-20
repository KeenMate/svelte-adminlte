<script lang="ts">
	import Inputmask from "inputmask"
	import {getValidityClass} from "../../helpers/class-helpers.js"
	
	type Props = {
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
		    value        = $bindable(""),
		    name         = "",
		    placeholder  = "",
		    pattern      = null,
		    readonly     = false,
		    plaintext    = false,
		    disabled     = false,
		    inputMask    = null,
		    invalid      = false,
		    maxlength    = null,
		    size         = "md",
		    validity     = "none",
		    inputElement = $bindable(null),
		    onChange     = undefined,
		    onInput      = undefined,
		    onKeypress   = undefined,
		    onKeydown    = undefined,
		    onKeyup      = undefined,
		    onFocusin    = undefined,
		    onFocusout   = undefined,
		    ...restProps
	    }: Props = $props()

	export function isValid() {
		return inputElement?.validity.valid
	}

	$effect(() => {
		if (inputMask && inputElement) {
			//@ts-ignore
			Inputmask().mask(inputElement)
		}
	})
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
	{...restProps}
	class="form-control-{size || 'md'} {restProps.class || ''} {getValidityClass(validity)}"
	onchange={onChange}
	oninput={onInput}
	onkeypress={onKeypress}
	onkeydown={onKeydown}
	onkeyup={onKeyup}
	onfocusin={onFocusin}
	onfocusout={onFocusout}
/>
