<script lang="ts">
	export let color: string | boolean | null = null

	$: sidebarColor = color !== false ? (color && `sidebar-${color}`) || "sidebar-dark-primary" : ""
</script>

<aside class="main-sidebar {sidebarColor} elevation-4">
	<!-- Brand Logo -->
	<slot name="header" />

	<!-- Sidebar -->
	<div class="sidebar">
		<slot name="beforeNav" />

		<!-- Sidebar Menu -->
		<nav class="mt-2">
			<ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
				<!-- Add icons to the links using the .nav-icon class
							 with font-awesome or any other icon font library -->

				<slot />
			</ul>
		</nav>
		<!-- /.sidebar-menu -->

		<slot name="afterNav" />
	</div>
	<!-- /.sidebar -->

	<slot name="afterSidebar" />
</aside>
