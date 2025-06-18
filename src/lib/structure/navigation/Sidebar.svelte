<script lang="ts">
	type Props = {
		color?: string | boolean | null;
		header?: import("svelte").Snippet;
		beforeNav?: import("svelte").Snippet;
		children?: import("svelte").Snippet;
		afterNav?: import("svelte").Snippet;
		afterSidebar?: import("svelte").Snippet;
	}

	let {
		    color = null,
		    header,
		    beforeNav,
		    children,
		    afterNav,
		    afterSidebar
	    }: Props = $props()

	let sidebarColor = $derived(color !== false ? (color && `sidebar-${color}`) || "sidebar-dark-primary" : "")
</script>

<aside class="main-sidebar {sidebarColor} elevation-4">
	<!-- Brand Logo -->
	{@render header?.()}

	<!-- Sidebar -->
	<div class="sidebar">
		{@render beforeNav?.()}

		<!-- Sidebar Menu -->
		<nav class="mt-2">
			<ul class="nav nav-pills nav-sidebar flex-column" data-widget="treeview" role="menu">
				<!-- Add icons to the links using the .nav-icon class
							 with font-awesome or any other icon font library -->

				{@render children?.()}
			</ul>
		</nav>
		<!-- /.sidebar-menu -->

		{@render afterNav?.()}
	</div>
	<!-- /.sidebar -->

	{@render afterSidebar?.()}
</aside>
