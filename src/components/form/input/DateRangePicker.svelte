<script>
  import { createEventDispatcher, onDestroy } from "svelte";
  import jQuery from "jquery";
  import { DateRangePickerLocale } from "../../../constants/date";
  import InputGroup from "../structure/InputGroup.svelte";

  const dispatch = createEventDispatcher();

  export let inputElement = null;
  export let startDate = "";
  export let endDate = "";
  export let minDate = "";
  export let maxDate = "";
  export let alwaysShowCalendars = false;
  export let showCustomRangeLabel = false;
  export let ranges = undefined;
  export let singleDate = false;

  let dateRangePickerConfig;

  $: {
    let tmpConfig = {
      opens: "left",
      linkedCalendars: false,
      locale: DateRangePickerLocale,
      singleDatePicker: singleDate,
    };

    if (startDate) tmpConfig.startDate = startDate;
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
      if (singleDate) {
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
