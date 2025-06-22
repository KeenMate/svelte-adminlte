<script lang="ts">
	import Inputmask from "inputmask"

	type Props = {
		id?: string;
		value?: string;
		name?: string;
		placeholder?: string;
		pattern?: string | null | undefined
		readonly?: boolean;
		plaintext?: boolean;
		disabled?: boolean;
		inputMask?: string | null | undefined
		invalid?: boolean;
		maxlength?: number | null | undefined
		size?: string | null | undefined
		inputElement?: HTMLInputElement | null | undefined
		onChange?: (ev: Event) => void
		onInput?: (ev: Event) => void
		onKeypress?: (ev: Event) => void
		onKeydown?: (ev: Event) => void
		onKeyup?: (ev: Event) => void

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
		    size         = null,
		    inputElement = $bindable(null),
		    onChange = undefined,
		    onInput = undefined,
		    onKeypress = undefined,
		    onKeydown = undefined,
		    onKeyup = undefined,
		    ...restProps
	    }: Props = $props()

	export function isValid() {
		return inputElement?.validity.valid
	}

	// @ts-ignore
	$effect(() => {
		inputElement && Inputmask().mask(inputElement)
	})
</script>

<input
	bind:this={inputElement}
	bind:value
	type="url"
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
	onkeydown={onKeydown}
	onkeyup={onKeyup}
/>
