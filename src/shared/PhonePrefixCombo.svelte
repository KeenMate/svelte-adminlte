<script>
	import {createEventDispatcher} from "svelte"

	const dispatch = createEventDispatcher()

	export let value = ""
	export let label = "Mobile phone prefix"
	export let title = "If your country is not specified you can include your phone prefix in phone number"
	export let placeholder = "Select country"

	function onChange(ev) {
		dispatch("change", ev.target.value)
	}
</script>

<label>{label}</label>
<select {value} class="form-control input-sm" on:change={onChange}>
	<option value="">{placeholder}</option>
	<option value="+420">🇨🇿 Czechia (+420)</option>
	<option value="+49">🇩🇪 Germany (+49)</option>
	<option value="+33">🇫🇷 France (+33)</option>
	<option value="+1">🇺🇸 USA (+1)</option>
</select>
