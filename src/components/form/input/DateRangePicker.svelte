<script>
  import { createEventDispatcher, onDestroy } from "svelte";
  import jQuery from "jquery";
  import { DateRangePickerLocale } from "../../../constants/date";
  import InputGroup from "../structure/InputGroup.svelte";

  const dispatch = createEventDispatcher();

  export let startDate = "";
  export let endDate = "";
  export let minDate = "";
  export let maxDate = "";
  export let opens = "right";
  export let alwaysShowCalendars = false;
  export let showCustomRangeLabel = false;
  export let autoApply = false;
  export let singleDatePicker = false;
  export let disabled = false;
  export let ranges = undefined;
  export let inputElement = null;

  let dateRangePickerConfig;

  $: {
    let tmpConfig = {
      linkedCalendars: false,
      locale: DateRangePickerLocale,
    };

    // date range picker does not like nullish props in config - so I am setting them exclusively
    if (startDate) tmpConfig.startDate = startDate;
    if (singleDatePicker) tmpConfig.singleDatePicker = singleDatePicker;
    if (opens) tmpConfig.opens = opens;
    if (autoApply) tmpConfig.autoApply = autoApply;
    if (endDate) tmpConfig.endDate = endDate;
    if (minDate) tmpConfig.minDate = minDate;
    if (maxDate) tmpConfig.maxDate = maxDate;
    if (showCustomRangeLabel) tmpConfig.showCustomRangeLabel = showCustomRangeLabel;
    if (alwaysShowCalendars) tmpConfig.alwaysShowCalendars = alwaysShowCalendars;

    dateRangePickerConfig = tmpConfig;
  }

  $: dateRangePicker =
    inputElement &&
    jQuery(inputElement).daterangepicker(dateRangePickerConfig, function (start, end) {
      if (disabled) return;

      if (singleDatePicker) {
        dispatch("change", { date: start });
      } else {
        dispatch("change", { startDate: start, endDate: end });
      }
    });

  onDestroy(() => {
    jQuery(inputElement).daterangepicker("destroy");
  });
</script>

<slot />
