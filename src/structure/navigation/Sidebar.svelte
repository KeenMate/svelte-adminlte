<script>
  export let color = null

  $: sidebarColor = color !== false
    ? color && `sidebar-${color}` || "sidebar-dark-primary"
    : ""
</script>

<!-- Main Sidebar Container -->
<aside class="main-sidebar {sidebarColor} elevation-4">
  <!-- Brand Logo -->
  <a href="#/" class="brand-link">
    <!-- <img src="dist/img/AdminLTELogo.png" alt="AdminLTE Logo" class="brand-image img-circle elevation-3"
           style="opacity: .8"> -->
    <slot name=header></slot>
  </a>

  <!-- Sidebar -->
  <div class="sidebar">
    <!-- Sidebar Menu -->
    <nav class="mt-2">
      <ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
        <!-- Add icons to the links using the .nav-icon class
               with font-awesome or any other icon font library -->

        <slot />
      </ul>
    </nav>
    <!-- /.sidebar-menu -->
  </div>
  <!-- /.sidebar -->
</aside>
