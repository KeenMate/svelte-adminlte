<script>
	import Litepicker from "litepicker"

	import {createEventDispatcher} from "svelte"

	const dispatch = createEventDispatcher()

	export let inputElement = null
	export let startDate = ""
	export let endDate = ""
	export let minDate = ""
	export let maxDate = ""
	export let position = "bottom right"
	export let single = false
	export let disabled = false
	export let visibleMonths = 2
	export let columns = 2
	export let lockDaysFilter = undefined
	export let lockDays = []

	export let allowRepick = false
	export let autoApply = true
	export let autoRefresh = false
	export let buttonText = undefined
	export let delimetr = " - "
	export let disallowLockDaysInRange = false
	export let dropdowns = {"minYear": 1990, "maxYear": null, "months": false, "years": false}
	export let elementEnd = null
	export let firstDay = 1
	export let format = "YYYY-MM-DD"
	export let highlightedDays = []
	export let highlightedDaysFormat = "YYYY-MM-DD"
	export let inlineMode = false
	export let lang = "en-US"
	export let lockDaysFormat = "YYYY-MM-DD"
	export let lockDaysInclusivity = "[]"
	export let maxDays = null
	export let minDays = null
	export let parentEl = null
	export let scrollToDate = true
	export let selectBackward = false
	export let selectForward = false
	export let showTooltip = true
	export let showWeekNumbers = false
	export let splitView = false
	export let switchingMonths = null
	export let tooltipNumber = null
	export let tooltipText = {"one": "day", "other": "days"}
	export let zIndex = 9999

	let picker
	$: if (inputElement) {
		picker = new Litepicker({
			element: inputElement,
			singleMode: single,
			startDate,
			endDate,
			minDate,
			maxDate,
			position,
			numberOfMonths: visibleMonths,
			numberOfColumns: columns,
			lockDays: lockDays,
			lockDaysFilter: disabled ? (_) => true : lockDaysFilter,
			allowRepick, autoApply, autoRefresh, buttonText, delimetr, disallowLockDaysInRange,
			dropdowns, elementEnd, firstDay, format, highlightedDays, highlightedDaysFormat,
			inlineMode, lang, lockDaysFormat, lockDaysInclusivity, maxDays, minDays, parentEl,
			scrollToDate, selectBackward, selectForward, showTooltip, showWeekNumbers,
			splitView, switchingMonths, tooltipNumber, tooltipText, zIndex

		})
	}

	$: picker && picker.on("selected", (ds, de) => dispatch("selected", {start: ds, end: de}))
	$: picker && picker.on("show", (el) => dispatch("show", el))
	$: picker && picker.on("render", (ui) => dispatch("render", ui))
	$: picker && picker.on("button:apply", (ds, de) => dispatch("apply", {start: ds, end: de}))
</script>

<slot />
