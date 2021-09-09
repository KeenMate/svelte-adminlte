<script>
  export let id = "";
  export let value = "";
  export let name = "";
  export let placeholder = "";
  export let pattern = null;
  export let readonly = false;
  export let disabled = false;

  export let inputElement = null;

  export function isValid() {
    return inputElement.validity.valid;
  }
</script>

<input
  bind:this={inputElement}
  class="form-control input-sm {$$props.class || ''}"
  bind:value={value}
  {name}
  type="text"
  {id}
  {placeholder}
  {pattern}
  {readonly}
  {disabled}
  on:keypress
/>
