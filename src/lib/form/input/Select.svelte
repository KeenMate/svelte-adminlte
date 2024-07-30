<script lang="ts">
	import {getValidityClass} from "$lib/helpers/class-helpers.js"
	import TextInput from "$lib/form/input/TextInput.svelte"
	import {Validity} from "$lib/constants/index.js"

	type Option = {[key: string]: any}


	export let id: string = ""
	export let value: string = ""
	export let name: string = ""
	export let options: Option[] = []
	export let disabled: boolean = false
	export let invalid: boolean = false
	export let size: string = "md"
	export let validity: Validity = Validity.None
	export let searchBar: boolean = false
	export let internalSearch: boolean = true
	export let trackBy: string = "value"
	export let optionLabel: string = "label"

	let selectElement
	let typeaheadInput: string = ""
	let filteredOptions: Option[]

	$: getOptionLabel = (option: Option) => option[optionLabel]

	$: if (internalSearch) {
		filteredOptions = options.filter(
			option =>
				getOptionLabel(option).toLowerCase().includes(typeaheadInput.toLowerCase()) ||
				option[trackBy].toLowerCase().includes(typeaheadInput.toLowerCase())
		)
	} else {
		filteredOptions = options
	}

	$: if (!value && filteredOptions.length > 0) {
		value = filteredOptions[0][trackBy]
	}
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
	{...$$restProps}
	class:is-invalid={invalid}
	class="form-control-{size || 'md'} custom-select {getValidityClass(validity)} {$$restProps.class || ''}"
	on:change
	on:focusin
	on:focusout
>
	{#each filteredOptions as option (option[trackBy])}
		<option value={option[trackBy]}>{getOptionLabel(option)}</option>
	{/each}
</select>
