<script>
  import Litepicker from "litepicker";

  import { createEventDispatcher, onDestroy } from "svelte";
  // import jQuery from "jquery";
  // import { DateRangePickerLocale } from "../../../constants/date";

  const dispatch = createEventDispatcher();

  export let inputElement = null;
  export let startDate = "";
  export let endDate = "";
  export let minDate = "";
  export let maxDate = "";
  export let position = "bottom right";
  export let single = false;
  export let disabled = false;
  export let visibleMonths = 2;
  export let columns = 2;
  // export let alwaysShowCalendars = false;
  // export let showCustomRangeLabel = false;
  // export let autoApply = false;
  // export let ranges = undefined;

  let picker;

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
      // dropdowns: {"minYear":1990,"maxYear":2030,"months":true,"years":true},
      lockDaysFilter: disabled ? (_) => true : undefined,
    });
  }
</script>

<slot />
