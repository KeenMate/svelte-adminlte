<script lang="ts">
	type Props = {
		id?: string;
		value?: string;
		name?: string;
		placeholder?: string;
		size: any;
		disabled?: boolean;
		invalid?: boolean;
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
		    size,
		    disabled     = false,
		    invalid      = false,
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
</script>

<input
	bind:this={inputElement}
	bind:value
	type="password"
	class="form-control form-control-{size || 'md'} {restProps.class || ''}"
	class:is-invalid={invalid}
	{id}
	{placeholder}
	{name}
	{disabled}
	onchange={onChange}
	oninput={onInput}
	onkeypress={onKeypress}
	onkeydown={onKeydown}
	onkeyup={onKeyup}
	onfocusin={onFocusin}
	onfocusout={onFocusout}
/>
