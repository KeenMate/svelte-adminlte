<script>
	import {toggleSidebarOpened} from "../../../stores/sidebar-open-state"

	function onToggleSidenav() {
		toggleSidebarOpened()
	}
</script>

<a
	href="#"
	class="sidebar-toggle"
	data-toggle="push-menu"
	role="button"
	on:click={onToggleSidenav}
>
	<i class="fa fa-bars"></i>
</a>

<style lang="sass">
	.sidebar-toggle:before
		content: none
</style>
