<script>
  export let id = "";
  export let value = "";
  export let name = "";
  export let placeholder = "";
  export let pattern = null;
  export let readonly = false;
  export let disabled = false;
  export let size = "sm"

  export let inputElement = null;

  export function isValid() {
    return inputElement.validity.valid;
  }
</script>

<input
  bind:this={inputElement}
  class="form-control form-control-{size} {$$props.class || ''}"
  bind:value={value}
  {name}
  type="email"
  {id}
  {placeholder}
  {pattern}
  {readonly}
  {disabled}
  on:keypress
  on:input
  on:change
/>
