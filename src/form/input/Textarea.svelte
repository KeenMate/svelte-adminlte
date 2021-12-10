<script>
  export let id = "";
  export let value = "";
  export let name = "";
  export let rows = 2;
  export let cols = "";
  export let placeholder = "";
  export let pattern = null;
  export let readonly = false;
  export let disabled = false;
  export let maxlength = "";


  let inputElement = null;

  export function isValid() {
    return inputElement.validity.valid;
  }
</script>

<textarea
  bind:this={inputElement}
  class="form-control input-sm {$$props.class || ''}"
  {rows}
  {cols}
  bind:value
  {name}
  {id}
  {placeholder}
  {pattern}
  {readonly}
  {disabled}
  {maxlength}
/>
