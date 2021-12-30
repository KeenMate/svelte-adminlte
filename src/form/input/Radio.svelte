<script>
  export let id = "";
  export let value = "";
  export let name = "";
  export let disabled = false;
  export let group;
  export let level = "primary";
</script>

<div class="icheck-{level} {$$props.class || ''}">
  <input type="radio" bind:group {disabled} {id} {value} {name} on:click />
  <slot />
</div>

