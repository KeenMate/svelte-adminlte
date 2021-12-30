<script>
  export let href = "#";
</script>

<a {href} on:click class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown" {...$$restProps}>
  <slot />
</a>
