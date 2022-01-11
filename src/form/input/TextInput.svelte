<script>
  import Inputmask from "inputmask";

  export let id = "";
  export let value = "";
  export let name = "";
  export let placeholder = "";
  export let pattern = null;
  export let readonly = false;
  export let disabled = false;
  export let inputMask = null;
  export let invalid = false;
  export let size = "sm"

  export let inputElement = null;

  export function isValid() {
    return inputElement.validity.valid;
  }

  $: inputElement && Inputmask().mask(inputElement);
</script>

<input
  bind:this={inputElement}
  bind:value
  class="form-control form-control-{size} {$$props.class || ''}"
  class:is-invalid={invalid}
  type="text"
  data-inputmask={inputMask || ""}
  {id}
  {name}
  {placeholder}
  {pattern}
  {readonly}
  {disabled}
  on:keypress
/>
