<script>
  export let href = "#";
</script>

<li class="nav-item dropdown">
  <a {href} class="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-toggle="dropdown"><slot /></a>
  <div class="dropdown-menu">
    <slot name="dropdown" />
  </div>
</li>
