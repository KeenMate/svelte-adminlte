<!-- Main Sidebar Container -->
<aside class="main-sidebar sidebar-dark-primary elevation-4">
  <!-- Brand Logo -->
  <a href="index3.html" class="brand-link">
    <!-- <img src="dist/img/AdminLTELogo.png" alt="AdminLTE Logo" class="brand-image img-circle elevation-3"
           style="opacity: .8"> -->
    <span class="brand-text font-weight-light">AdminLTE 3</span>
  </a>

<aside class="main-sidebar">
	<div class="slimScrollDiv">
		<section class="sidebar">
			<ul class="sidebar-menu tree" data-widget="tree">
				<li>
					<a href="#/comms/new">
						<i class="fa fa-envelope"></i>
						<span>Nová komunikace</span>
					</a>
				</li>
				<li>
					<a href="#/">
						<i class="fa fa-mail-bulk"></i>
						<span>Komunikace</span>
					</a>
				</li>
				{#if $currentUserIsAdminStore}
					<li>
						<a href="#/publishing-overview">
							<i class="fa fa-image"></i>
							<span>Publikační přehled</span>
						</a>
					</li>
					<li>
						<a href="#/permissions">
							<i class="fa fa-user-shield"></i>
							<span>Oprávnění</span>
						</a>
					</li>
					<li>
						<a href="#/dist-channels">
							<i class="fa fa-share-alt-square"></i>
							<span>Distribuční kanály</span>
						</a>
					</li>
					<li>
						<a href="#/comm-channels">
							<i class="fa fa-comments"></i>
							<span>Komunikační kanály</span>
						</a>
					</li>
				{/if}
			</ul>
		</section>
		<div class="slimScrollBar"></div>
		<div class="slimScrollRail"></div>
	</div>
</aside>
