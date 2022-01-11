<script>
  export let id = "";
  export let value = "";
  export let name = "";
  export let placeholder = "";
  export let size = "sm"
  export let disabled = false;
  export let invalid = false;

  export let inputElement = null;
</script>

<input
  bind:this={inputElement}
  bind:value
  class="form-control form-control-{size} {$$props.class || ''}"
  class:is-invalid={invalid}
  type="password"
  {id}
  {name}
  {placeholder}
  {disabled}
  on:keypress
  on:input
  on:change
/>
