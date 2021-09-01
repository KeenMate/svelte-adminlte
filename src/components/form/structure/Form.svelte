<script>
  export let form;
</script>

<form use:form class={$$props.class || ''}>
  <slot/>
</form>