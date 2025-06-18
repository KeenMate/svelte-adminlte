<script lang="ts">
	type Props = {
		id?: string;
		value?: string;
		name?: string;
		placeholder?: string;
		pattern?: any;
		readonly?: boolean;
		plaintext?: boolean;
		disabled?: boolean;
		size: any;
		inputElement?: any;
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
		    size,
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
		return inputElement.validity.valid
	}
</script>

<input
	bind:this={inputElement}
	bind:value
	type="email"
	class="form-control-{size || 'md'} {restProps.class || ''}"
	class:form-control={!plaintext}
	class:form-control-plaintext={plaintext}
	{id}
	{name}
	{pattern}
	{placeholder}
	{readonly}
	{disabled}
	onchange={onChange}
	oninput={onInput}
	onkeypress={onKeypress}
	onkeydown={onKeydown}
	onkeyup={onKeyup}
	onfocusin={onFocusin}
	onfocusout={onFocusout}
/>
