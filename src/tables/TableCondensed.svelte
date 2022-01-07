<script>
  import TableEmptyRow from "./TableEmptyRow.svelte";

  export let emptyRowText;
</script>

<table class="table table-sm data-table {$$props.class || ''}">
  <thead>
    <slot name="headers" />
  </thead>
  <tbody>
    <slot>
      <TableEmptyRow emptyRowText={emptyRowText}/>
    </slot>
  </tbody>
</table>
