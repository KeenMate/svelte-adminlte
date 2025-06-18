<script lang="ts">
	type Props = {
		id?: any;
		value?: any;
		min?: any;
		max?: any;
		onInput?: (ev: Event) => void
		onChange?: (ev: Event) => void
		onFocus?: (ev: Event) => void
		onBlur?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    id    = null,
		    value = $bindable(null),
		    min   = null,
		    max   = null,
		    onInput = undefined,
		    onChange = undefined,
		    onFocus = undefined,
		    onBlur = undefined,
		    ...restProps
	    }: Props = $props()
</script>

<input
	bind:value
	type="range"
	class="custom-range {restProps.class || ''}"
	{id}
	{min}
	{max}
	oninput={onInput}
	onchange={onChange}
	onfocus={onFocus}
	onblur={onBlur}
/>
