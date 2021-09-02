<script>
  export let inputId;
</script>

<label class="form-check-label {$$props.class || ''}" for={inputId}>
  <slot />
</label>
