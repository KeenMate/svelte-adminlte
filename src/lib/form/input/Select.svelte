<script lang="ts">
	import {getValidityClass} from "$lib/helpers/class-helpers.js"
	import TextInput from "$lib/form/input/TextInput.svelte"
	import {Validity} from "$lib/constants/index.js"

	type Option = { [key: string]: any }

	type Props = {
		id?: string;
		value?: string;
		name?: string;
		options?: Option[];
		disabled?: boolean;
		invalid?: boolean;
		size?: string;
		validity?: Validity;
		searchBar?: boolean;
		internalSearch?: boolean;
		trackBy?: string;
		optionLabel?: string;
		onChange?: (ev: Event) => void
		onFocusin?: (ev: Event) => void
		onFocusout?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    id             = "",
		    value          = $bindable(""),
		    name           = "",
		    options        = [],
		    disabled       = false,
		    invalid        = false,
		    size           = "md",
		    validity       = Validity.None,
		    searchBar      = false,
		    internalSearch = true,
		    trackBy        = "value",
		    optionLabel    = "label",
		    onChange = undefined,
		    onFocusin = undefined,
		    onFocusout = undefined,
		    ...restProps
	    }: Props = $props()

	let selectElement             = $state()
	let typeaheadInput: string    = $state("")
	let filteredOptions: Option[] = $state()

	let getOptionLabel = $derived((option: Option) => option[optionLabel])

	run(() => {
		if (internalSearch) {
			filteredOptions = options.filter(
				option =>
					getOptionLabel(option).toLowerCase().includes(typeaheadInput.toLowerCase()) ||
					option[trackBy].toLowerCase().includes(typeaheadInput.toLowerCase())
			)
		} else {
			filteredOptions = options
		}
	})

	run(() => {
		if (!value && filteredOptions.length > 0) {
			value = filteredOptions[0][trackBy]
		}
	})
</script>

{#if searchBar}
	<div>
		<TextInput
			bind:value={typeaheadInput}
		/>
	</div>
{/if}

<select
	bind:this={selectElement}
	bind:value
	{id}
	{name}
	{disabled}
	{...restProps}
	class:is-invalid={invalid}
	class="form-control-{size || 'md'} custom-select {getValidityClass(validity)} {restProps.class || ''}"
	onchange={onChange}
	onfocusin={onFocusin}
	onfocusout={onFocusout}
>
	{#each filteredOptions as option (option[trackBy])}
		<option value={option[trackBy]}>{getOptionLabel(option)}</option>
	{/each}
</select>
