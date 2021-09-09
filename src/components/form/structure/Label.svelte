<script>
  export let inputId;
</script>

<label class="{$$props.class || ''}" for={inputId}>
  <slot />
</label>
