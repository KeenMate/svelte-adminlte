<script lang="ts">
	import {run} from "svelte/legacy"

	// TODO merge common code with multiselect

	import {createEventDispatcher, onMount} from "svelte"
	import jQuery from "jquery"
	import {debounce} from "lodash"
	import {TypingDebounceDelay} from "../../../constants/ui.js"

	type Props = {
		value?: any;
		placeholder?: string;
		readonly?: boolean;
		invalid?: boolean;
		size: any;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    value       = $bindable(null),
		    placeholder = "",
		    readonly    = false,
		    invalid     = false,
		    size,
		    children,
		    ...restProps
	    }: Props = $props()

	const dispatch = createEventDispatcher()

	let selectElement  = $state(null)
	let select$        = $state(null)
	let searchDebounce = debounce(x => {
		dispatch("search", x)
	}, TypingDebounceDelay)

	run(() => {
		jQuery(selectElement).val(value).trigger("change")
	})
	run(() => {
		select$?.select2({disabled: readonly && "readonly"})
	})

	function attachSelectEvent(select$) {
		select$.on("select2:select", ev => {
			const selectedValues = Array.from(ev.target.selectedOptions).map(x => x.value)
			dispatch("change", selectedValues[0])
		})
	}

	function onKeyPress(ev) {
		searchDebounce(ev.target.value)
	}

	function attachKeyDownEvent(select$) {
		select$.on("select2:open", () => {
			document.addEventListener("keydown", onKeyPress, true)
		})

		select$.on("select2:close", () => {
			document.removeEventListener("keydown", onKeyPress, true)
		})
	}

	onMount(() => {
		select$ = jQuery(selectElement).select2({
			language: {
				noResults() {
					return "Žádné výsledky"
				}
			}
		})
		attachSelectEvent(select$)
		attachKeyDownEvent(select$)
	})
</script>

<select
	aria-hidden="true"
	bind:this={selectElement}
	bind:value
	class="form-control select2 select2-hidden-accessible form-control-{size ||
		'md'} {restProps.class || ''}"
	class:is-invalid={invalid}
	data-placeholder={placeholder}
	{readonly}
	style="width: 100%;"
	tabindex="-1"
>
	{@render children?.()}
</select>

<style lang="sass">
	:global
		.select2-selection__choice
			padding: 0 !important
			padding-left: 20px !important

		.select2-selection
			height: 30px !important
			padding-top: 4px !important
			padding-bottom: 4px !important

			.select2-selection__arrow
				height: 24px !important

		.select2-results__option
			padding-top: 4px !important
			padding-bottom: 4px !important
</style>
