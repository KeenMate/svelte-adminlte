<script lang="ts">
	import {run} from "svelte/legacy"

	import {createEventDispatcher, onDestroy} from "svelte"
	import Litepicker from "litepicker"

	const dispatch = createEventDispatcher()

	type resetBtnFunc = () => HTMLElement

	type Props = {
		inputElement?: HTMLInputElement | null;
		startDate?: string | "";
		endDate?: string | "";
		minDate?: Date | undefined;
		maxDate?: Date | undefined;
		position?: string;
		single?: boolean;
		disabled?: boolean;
		visibleMonths?: number;
		columns?: number;
		lockDaysFilter?: Function | null;
		lockDays?: Date[];
		allowRepick?: boolean;
		autoApply?: boolean;
		autoRefresh?: boolean;
		buttonText?: {
			apply?: string
			cancel?: string
			previousMonth?: string
			nextMonth?: string
			reset?: string
		} | null;
		delimetr?: string;
		disallowLockDaysInRange?: boolean;
		dropdowns?: any;
		elementEnd?: HTMLInputElement | null;
		firstDay?: number;
		format?: string;
		highlightedDays?: Date[];
		highlightedDaysFormat?: string;
		inlineMode?: boolean;
		lang?: string;
		lockDaysFormat?: string;
		lockDaysInclusivity?: string;
		maxDays?: number | null;
		minDays?: number | null;
		parentEl?: HTMLElement | null;
		scrollToDate?: boolean;
		selectBackward?: boolean;
		selectForward?: boolean;
		showTooltip?: boolean;
		showWeekNumbers?: boolean;
		resetButton?: boolean | resetBtnFunc;
		splitView?: boolean;
		switchingMonths?: number | null;
		tooltipNumber?: number | null;
		tooltipText?: any;
		zIndex?: number;
		children?: import("svelte").Snippet;
	}

	let {
		    inputElement            = null,
		    startDate               = "",
		    endDate                 = "",
		    minDate                 = undefined,
		    maxDate                 = undefined,
		    position                = "bottom right",
		    single                  = false,
		    disabled                = false,
		    visibleMonths           = 2,
		    columns                 = 2,
		    lockDaysFilter          = null,
		    lockDays                = [],
		    allowRepick             = false,
		    autoApply               = true,
		    autoRefresh             = false,
		    buttonText              = null,
		    delimetr                = " - ",
		    disallowLockDaysInRange = false,
		    dropdowns               = {minYear: 1990, maxYear: null, months: false, years: false},
		    elementEnd              = null,
		    firstDay                = 1,
		    format                  = "YYYY-MM-DD",
		    highlightedDays         = [],
		    highlightedDaysFormat   = "YYYY-MM-DD",
		    inlineMode              = false,
		    lang                    = "en-US",
		    lockDaysFormat          = "YYYY-MM-DD",
		    lockDaysInclusivity     = "[]",
		    maxDays                 = null,
		    minDays                 = null,
		    parentEl                = null,
		    scrollToDate            = true,
		    selectBackward          = false,
		    selectForward           = false,
		    showTooltip             = true,
		    showWeekNumbers         = false,
		    resetButton             = false,
		    splitView               = false,
		    switchingMonths         = null,
		    tooltipNumber           = null,
		    tooltipText             = {one: "day", other: "days"},
		    zIndex                  = 9999,
		    children
	    }: Props = $props()

	let picker: any = $state()


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
			element:         inputElement,
			singleMode:      single,
			startDate,
			endDate,
			minDate,
			maxDate,
			position,
			numberOfMonths:  visibleMonths,
			numberOfColumns: columns,
			lockDays:        lockDays,
			lockDaysFilter:  disabled ? (_: Date) => true : lockDaysFilter,
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

	run(() => {
		inputElement && initPicker()
	})
	run(() => {
		picker &&
		(single
			? checkValidDate(startDate) && picker.setDate(startDate)
			: checkValidDate(startDate) &&
			checkValidDate(endDate) &&
			picker.setDateRange(startDate, endDate))
	})
	run(() => {
		picker && (picker.off("selected", onSelected), picker.on("selected", onSelected))
	})
	run(() => {
		picker && (picker.off("show", onShow), picker.on("show", onShow))
	})
	run(() => {
		picker && (picker.off("render", onRender), picker.on("render", onRender))
	})
	run(() => {
		picker && (picker.off("button:apply", onButtonApply), picker.on("button:apply", onButtonApply))
	})
	run(() => {
		picker &&
		(picker.off("clear:selection", onClearSelection),
			picker.on("clear:selection", onClearSelection))
	})
</script>

{@render children?.()}
