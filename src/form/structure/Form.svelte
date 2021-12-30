<script>
  export let form;
  export let horizontal = false;

  $: formParam = form || (() => {});
</script>

<form use:formParam class:form-horizontal={horizontal} class={$$props.class || ""} {...$$restProps}>
  <slot />
</form>
