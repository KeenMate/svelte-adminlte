<script>
  export let inputId;
</script>

<label class="control-label {$$props.class || ''}" for={inputId}>
  <slot />
</label>
