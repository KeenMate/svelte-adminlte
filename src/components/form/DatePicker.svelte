<script>
	import {createEventDispatcher} from "svelte"
	import jQuery from "jquery"
	import moment from "moment"
	import {DisplayDateFormat} from "../../constants/date"

	const dispatch = createEventDispatcher()

	export let value = null
	export let format = "dd. mm. yyyy"
	export let language = "cs"
	export let orientation = "bottom left"
	export let minDate = null
	export let maxDate = null
	export let id = ""
	export let placeholder = ""
	export let hideLabel = false
	export let disabled = false

	let inputGroupElement = null

	$: jDateTimePicker = inputGroupElement && jQuery(inputGroupElement).datepicker({
		autoclose: true,
		format,
		orientation,
		language,
		startDate: minDate,
		endDate: maxDate
	})

	$: jDateTimePicker?.datepicker("setDate", value)
	$: jDateTimePicker?.datepicker("setStartDate", minDate)
	$: jDateTimePicker?.datepicker("setEndDate", maxDate)

	$: jDateTimePicker?.off("changeDate", onChangeDate)
	$: jDateTimePicker?.on("changeDate", onChangeDate)

	function onChangeDate({date}) {
		const parsedOriginalValue = typeof value === "string"
			? moment(value, DisplayDateFormat)
			: moment(value)

		if ((!value && !date) || parsedOriginalValue.isSame(moment(date), "day"))
			return

		dispatch("change", date)
	}
</script>

<div class="form-group">
	{#if $$slots.label && !hideLabel}
		<label for="{id}">
			<slot name="label" />
		</label>
	{/if}
	<div bind:this={inputGroupElement} class="input-group date">
		<input
			type="text"
			class="form-control input-sm"
			{id}
			{placeholder}
			{disabled}
		>
		<span class="input-group-addon">
		<i class="fas fa-calendar"></i>
	</span>
	</div>
</div>
