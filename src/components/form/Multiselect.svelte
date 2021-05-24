<script>
	import {createEventDispatcher, onMount} from "svelte"
	import jQuery from "jquery"
	import FormGroup from "./FormGroup.svelte"
	import {debounce} from "lodash"
	import {TypingDebounceDelay} from "../../constants/ui"

	export let value = null
	export let multiple = false
	export let placeholder = ""

	const dispatch = createEventDispatcher()

	let selectElement = null
	let searchDebounce = debounce(x => {
		dispatch("search", x)
	}, TypingDebounceDelay)

	$: jQuery(selectElement).val(value).trigger("change")

	function attachSelectEvent(select$) {
		select$.on("select2:select", ev => {
			const selectedValues = Array
				.from(ev.target.selectedOptions)
				.map(x => x.value)
			dispatch("change", selectedValues)
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
		const select$ = jQuery(selectElement).select2()
		attachSelectEvent(select$)
		attachKeyDownEvent(select$)
	})
</script>

{#if $$slots.label}
	<FormGroup>
		<slot name="label" slot="label" />
		<select
			bind:this={selectElement}
			{value}
			{multiple}
			class="form-control select2 select2-hidden-accessible"
			data-placeholder="{placeholder}"
			style="width: 100%;"
			tabindex="-1"
			aria-hidden="true"
		>
			<slot />
		</select>
	</FormGroup>
{:else}

	<FormGroup>
		<select
			bind:this={selectElement}
			{value}
			{multiple}
			class="form-control select2 select2-hidden-accessible"
			data-placeholder="{placeholder}"
			style="width: 100%;"
			tabindex="-1"
			aria-hidden="true"
		>
			<slot />
		</select>
	</FormGroup>
{/if}
