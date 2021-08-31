<script>
	import {createEventDispatcher} from "svelte"
	import currentUserStore, {currentUserRoleStringifiedStore} from "../../../stores/current-user"
	import darkTheme from "../../../stores/dark-theme"

	const dispatch = createEventDispatcher()

	$: displayName = $currentUserStore?.displayName || "Neznámý"

	function onToggleTheme(ev) {
		ev.preventDefault()
		darkTheme.toggle()
	}
</script>

<li class="dropdown user user-menu">
	<a href="#" class="dropdown-toggle" data-toggle="dropdown">
		<span class="hidden-sm hidden-xs">
			{displayName}
			{#if $currentUserRoleStringifiedStore}
				({$currentUserRoleStringifiedStore})
			{/if}
		</span>
		<span class="visible-sm visible-xs">
			<i class="fas fa-user"></i>
		</span>
	</a>
	<ul class="dropdown-menu">
		<li class="user-body">
			<div class="row">
				<!--<div class="col-xs-offset-6 col-xs-6 text-center">-->
				<!--	<button-->
				<!--		class="btn btn-sm"-->
				<!--		class:bg-navy={!darkTheme}-->
				<!--		class:bg-gray={darkTheme}-->
				<!--		on:click={onToggleTheme}-->
				<!--	>-->
				<!--		{#if darkTheme}-->
				<!--			Světlé téma-->
				<!--		{:else}-->
				<!--			Černé téma-->
				<!--		{/if}-->
				<!--	</button>-->
				<!--</div>-->
			</div>
			<!-- /.row -->
		</li>
		<!-- Menu Footer-->
		<li class="user-footer">
			<div class="pull-left">
				<a href="#" class="btn btn-default btn-flat btn-sm">
					{displayName}
				</a>
			</div>
			<div class="pull-right">
				<a on:click={() => dispatch("logout")} class="btn btn-default btn-flat btn-sm">Odhlásit</a>
			</div>
		</li>
	</ul>
</li>

<style lang="sass">
	li.dropdown.user.user-menu
		ul.dropdown-menu
			li.user-body
				a
					color: black !important
</style>
