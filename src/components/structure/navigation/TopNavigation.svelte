<script>
  import MobileNavToggle from "./MobileNavToggle.svelte";
  import BrandNavLogoSidebar from "./BrandNavLogoSidebar.svelte";
  import UserDropdownMenu from "./UserDropdownMenu.svelte";

  function logout() {
    // todo: make logout
    // window.location.replace(LogoutPath)
  }
</script>

<!-- Navbar -->
<nav class="main-header navbar navbar-expand navbar-white navbar-light">
  <!-- Left navbar links -->
  <ul class="navbar-nav">
    <MobileNavToggle />

    <li class="nav-item d-none d-sm-inline-block">
      <a href="#/" class="nav-link">Home</a>
    </li>
    <li class="nav-item d-none d-sm-inline-block">
      <a href="#" class="nav-link">Contact</a>
    </li>
    <li class="nav-item dropdown">
      <a
        class="nav-link dropdown-toggle"
        href="#"
        id="navbarDropdown"
        role="button"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
      >
        Help
      </a>
      <div class="dropdown-menu" aria-labelledby="navbarDropdown">
        <a class="dropdown-item" href="#">FAQ</a>
        <a class="dropdown-item" href="#">Support</a>
        <div class="dropdown-divider" />
        <a class="dropdown-item" href="#">Contact</a>
      </div>
    </li>
  </ul>

  <!-- SEARCH FORM -->
  <form class="form-inline ml-3">
    <div class="input-group input-group-sm">
      <input class="form-control form-control-navbar" type="search" placeholder="Search" aria-label="Search" />
      <div class="input-group-append">
        <button class="btn btn-navbar" type="submit">
          <i class="fas fa-search" />
        </button>
      </div>
    </div>
  </form>

  <!-- Right navbar links -->
  <ul class="navbar-nav ml-auto">
    <!-- Messages Dropdown Menu -->
    <UserDropdownMenu on:logout={logout} />
  </ul>
</nav>
<!-- /.navbar -->
