<script lang="ts">
	import {createEventDispatcher, onDestroy} from "svelte"
	import Litepicker from "litepicker"

	const dispatch = createEventDispatcher()

	export let inputElement: HTMLInputElement | null = null
	export let startDate: string | "" = ""
	export let endDate: string | "" = ""
	export let minDate: Date | undefined = undefined
	export let maxDate: Date | undefined = undefined
	export let position = "bottom right"
	export let single = false
	export let disabled = false
	export let visibleMonths = 2
	export let columns = 2
	export let lockDaysFilter: Function | null = null
	export let lockDays: Date[] = []
	export let allowRepick = false
	export let autoApply = true
	export let autoRefresh = false
	export let buttonText: {
		apply?: string
		cancel?: string
		previousMonth?: string
		nextMonth?: string
		reset?: string
	} | null = null
	export let delimetr = " - "
	export let disallowLockDaysInRange = false
	export let dropdowns = {minYear: 1990, maxYear: null, months: false, years: false}
	export let elementEnd: HTMLInputElement | null = null
	export let firstDay = 1
	export let format = "YYYY-MM-DD"
	export let highlightedDays: Date[] = []
	export let highlightedDaysFormat = "YYYY-MM-DD"
	export let inlineMode = false
	export let lang = "en-US"
	export let lockDaysFormat = "YYYY-MM-DD"
	export let lockDaysInclusivity = "[]"
	export let maxDays: number | null = null
	export let minDays: number | null = null
	export let parentEl: HTMLElement | null = null
	export let scrollToDate = true
	export let selectBackward = false
	export let selectForward = false
	export let showTooltip = true
	export let showWeekNumbers = false
	type resetBtnFunc = () => HTMLElement
	export let resetButton: boolean | resetBtnFunc = false
	export let splitView = false
	export let switchingMonths: number | null = null
	export let tooltipNumber: number | null = null
	export let tooltipText = {one: "day", other: "days"}
	export let zIndex = 9999

	let picker: any
	$: inputElement && initPicker()

	$: picker &&
		(single
			? checkValidDate(startDate) && picker.setDate(startDate)
			: checkValidDate(startDate) &&
			  checkValidDate(endDate) &&
			  picker.setDateRange(startDate, endDate))
	$: picker && (picker.off("selected", onSelected), picker.on("selected", onSelected))
	$: picker && (picker.off("show", onShow), picker.on("show", onShow))
	$: picker && (picker.off("render", onRender), picker.on("render", onRender))
	$: picker && (picker.off("button:apply", onButtonApply), picker.on("button:apply", onButtonApply))
	$: picker &&
		(picker.off("clear:selection", onClearSelection),
		picker.on("clear:selection", onClearSelection))

	onDestroy(() => {
		picker && picker.destroy()
	})

	function checkValidDate(maybeDate: any) {
		//@ts-ignore
		return maybeDate == null || (typeof maybeDate === "string" && !isNaN(new Date(maybeDate)))
	}

	function initPicker() {
		if (picker) {
			picker.destroy()
		}

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
			lockDaysFilter: disabled ? (_: Date) => true : lockDaysFilter,
			allowRepick,
			autoApply,
			autoRefresh,
			buttonText,
			delimetr,
			disallowLockDaysInRange,
			dropdowns,
			elementEnd,
			firstDay,
			format,
			highlightedDays,
			highlightedDaysFormat,
			inlineMode,
			lang,
			lockDaysFormat,
			lockDaysInclusivity,
			maxDays,
			minDays,
			parentEl,
			scrollToDate,
			selectBackward,
			selectForward,
			showTooltip,
			showWeekNumbers,
			resetButton,
			splitView,
			switchingMonths,
			tooltipNumber,
			tooltipText,
			zIndex
		})
	}

	// function registerEventHandlers(p) {
	// 	if (!p)
	// 		return
	//
	// 	p.on("selected", onSelected)
	// 	p.on("show", onShow)
	// 	p.on("render", onRender)
	// 	p.on("button:apply", onButtonApply)
	// }
	//
	// function freeEventHandlers(p) {
	// 	if (!p)
	// 		return
	//
	// 	p.off("selected", onSelected)
	// 	p.off("show", onShow)
	// 	p.off("render", onRender)
	// 	p.off("button:apply", onButtonApply)
	// }

	function onSelected(ds: Date, de: Date) {
		dispatch("selected", {start: ds, end: de})
	}

	function onShow(el: HTMLElement) {
		dispatch("show", el)
	}

	function onRender(ui: any) {
		dispatch("render", ui)
	}

	function onButtonApply(ds: Date, de: Date) {
		dispatch("apply", {start: ds, end: de})
	}

	function onClearSelection() {
		dispatch("clear")
	}
</script>

<slot />
