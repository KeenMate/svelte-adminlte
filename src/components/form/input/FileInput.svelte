<script>
  import { createEventDispatcher } from "svelte";

  export let id = "";
  export let value = "";
  export let name = "";
  export let multiple = false;
  export let placeholder = "";
  export let pattern = null;
  export let readonly = false;

  const dispatch = createEventDispatcher();

  let inputElement = null;

  export function isValid() {
    return inputElement.validity.valid;
  }

  function onInput(ev) {
    const files = ev.target.files;

    dispatch("input", (!multiple && files && files[0]) || files);
  }
</script>

<input
  bind:this={inputElement}
  class="input-sm {$$props.class || ''}"
  type="file"
  {value}
  {name}
  {id}
  {placeholder}
  {pattern}
  {readonly}
  {multiple}
  on:input={onInput}
/>
