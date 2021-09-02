<script>
  import { createEventDispatcher, onMount } from "svelte";
  import jQuery from "jquery";
  import { debounce } from "lodash";
  import { TypingDebounceDelay } from "../../../constants/ui";

  export let value = null;
  export let placeholder = "";
  export let readonly = false;

  const dispatch = createEventDispatcher();

  let selectElement = null;
  let select$ = null;
  let searchDebounce = debounce((x) => {
    dispatch("search", x);
  }, TypingDebounceDelay);

  $: jQuery(selectElement).val(value).trigger("change");
  $: select$?.select2({ theme: "bootstrap4", disabled: readonly && "readonly" });

  function attachSelectEvent(select$) {
    select$.on("select2:select", (ev) => {
      const selectedValues = Array.from(ev.target.selectedOptions).map((x) => x.value);
      dispatch("change", selectedValues);
    });
  }

  function onKeyPress(ev) {
    searchDebounce(ev.target.value);
  }

  function attachKeyDownEvent(select$) {
    select$.on("select2:open", () => {
      document.addEventListener("keydown", onKeyPress, true);
    });

    select$.on("select2:close", () => {
      document.removeEventListener("keydown", onKeyPress, true);
    });
  }

  onMount(() => {
    select$ = jQuery(selectElement).select2({
      language: {
        noResults() {
          return "Žádné výsledky";
        },
      },
    });
    attachSelectEvent(select$);
    attachKeyDownEvent(select$);
  });
</script>

<select
  bind:this={selectElement}
  bind:value
  {readonly}
  multiple
  class="form-control select2 select2-hidden-accessible input-sm {$$props.class || ''}"
  data-placeholder={placeholder}
  style="width: 100%;"
  tabindex="-1"
  aria-hidden="true"><slot /></select
>

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
