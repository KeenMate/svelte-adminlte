<script>
  export let form;

$: formParam = form || (() => {})
</script>

<form use:formParam class={$$props.class || ''}>
  <slot/>
</form>
