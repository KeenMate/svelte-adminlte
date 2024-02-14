<script lang="ts">
	import {getValidityClass} from "../../helpers/class-helpers.ts"
	import {Validity} from "../../helpers/class-helpers.ts"
	import {TextInput} from "$lib/index.ts"

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
	export let searchFunction: Function
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

	function handleTypeaheadInput(event: Event) {
		if (event.target) {
			typeaheadInput = (event.target as HTMLInputElement).value
		}
	}
</script>

{#if searchBar}
	<div>
		<TextInput
			bind:value={typeaheadInput}
			on:input={handleTypeaheadInput}
		/>
	</div>
{/if}

<select
	bind:this={selectElement}
	bind:value
	class:is-invalid={invalid}
	{id}
	{name}
	{disabled}
	class="form-control-{size || 'md'} custom-select {getValidityClass(validity)}"
	{...$$restProps}
	on:change
	on:focusin
	on:focusout
>
	{#each filteredOptions as option (option[trackBy])}
		<option value={option[trackBy]}>{getOptionLabel(option)}</option>
	{/each}
</select>
