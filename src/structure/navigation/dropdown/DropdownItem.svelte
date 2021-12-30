<script>
  export let href = "#";
  export let active = false;
  export let disabled = false;
</script>

<a class="dropdown-item" on:click class:active class:disabled {href} {...$$restProps}>
  <slot />
</a>
