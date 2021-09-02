<script>
  import { toggleSidebarOpened } from "../../../stores/sidebar-open-state";

  function onToggleSidenav() {
    toggleSidebarOpened();
  }
</script>

<li class="nav-item">
  <a class="nav-link" data-widget="pushmenu" href="#" role="button" on:click={onToggleSidenav}>
    <i class="fas fa-bars" />
  </a>
</li>

<style lang="sass">
	.sidebar-toggle:before
		content: none
</style>
