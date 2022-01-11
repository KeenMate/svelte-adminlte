<script>
	import {createEventDispatcher} from "svelte"

	export let displayName = "Neznámý"
	export let darkTheme = false

	const dispatch = createEventDispatcher()

	function onToggleTheme(ev) {
		ev.preventDefault()
		dispatch("toggleTheme")
	}
</script>

<!-- <li class="dropdown user user-menu">
	<a href="#" class="dropdown-toggle" data-toggle="dropdown">
		<span class="hidden-sm hidden-xs">{displayName}</span>
		<span class="visible-sm visible-xs">
			<i class="fas fa-user"></i>
		</span>
	</a>
	<ul class="dropdown-menu">
		<li class="user-body">
			<div class="row">
				<div class="col-xs-offset-6 col-xs-6 text-center">
					<button
						class="btn"
						class:bg-navy={!darkTheme}
						class:bg-gray={darkTheme}
						on:click={onToggleTheme}
					>
						{#if darkTheme}
							Světlé téma
						{:else}
							Černé téma
						{/if}
					</button>
				</div>
			</div> -->
<!-- /.row -->
<!-- </li> -->
<!-- Menu Footer-->
<!-- <li class="user-footer">
			<div class="pull-left">
				<a href="#" class="btn btn-default btn-flat">
					{displayName}
				</a>
			</div>
			<div class="pull-right">
				<a on:click={() => dispatch("logout")} class="btn btn-default btn-flat">Odhlásit</a>
			</div>
		</li>
	</ul>
</li> -->

<!-- Messages Dropdown Menu -->
<li class="nav-item dropdown">
	<a class="nav-link" data-toggle="dropdown" href="#">
		<span class="d-none d-md-inline">{displayName}</span>
		<span class="d-inline d-md-none">
			<i class="fas fa-user"></i>
		</span>
	</a>
	<div class="dropdown-menu dropdown-menu-lg dropdown-menu-right">
		<a class="dropdown-item" href="#">
			<!-- Message Start -->
			<div class="media">
				<img src="" alt="User Avatar" class="img-size-50 mr-3 img-circle">
				<div class="media-body">
					<h3 class="dropdown-item-title">
						Brad Diesel
						<span class="float-right text-sm text-danger"><i class="fas fa-star"></i></span>
					</h3>
					<p class="text-sm">Call me whenever you can...</p>
					<p class="text-sm text-muted"><i class="far fa-clock mr-1"></i> 4 Hours Ago</p>
				</div>
			</div>
			<!-- Message End -->
		</a>
		<div class="dropdown-divider"></div>
		<a class="dropdown-item" href="#">
			<!-- Message Start -->
			<div class="media">
				<img alt="User Avatar" class="img-size-50 img-circle mr-3" src="">
				<div class="media-body">
					<h3 class="dropdown-item-title">
						John Pierce
						<span class="float-right text-sm text-muted"><i class="fas fa-star"></i></span>
					</h3>
					<p class="text-sm">I got your message bro</p>
					<p class="text-sm text-muted"><i class="far fa-clock mr-1"></i> 4 Hours Ago</p>
				</div>
			</div>
			<!-- Message End -->
		</a>
		<div class="dropdown-divider"></div>
		<a class="dropdown-item" href="#">
			<!-- Message Start -->
			<div class="media">
				<img alt="User Avatar" class="img-size-50 img-circle mr-3" src="">
				<div class="media-body">
					<h3 class="dropdown-item-title">
						Nora Silvester
						<span class="float-right text-sm text-warning"><i class="fas fa-star"></i></span>
					</h3>
					<p class="text-sm">The subject goes here</p>
					<p class="text-sm text-muted"><i class="far fa-clock mr-1"></i> 4 Hours Ago</p>
				</div>
			</div>
			<!-- Message End -->
		</a>
		<div class="dropdown-divider"></div>
		<a class="dropdown-item dropdown-footer" href="#">See All Messages</a>
	</div>
</li>

<style lang="sass">
	li.dropdown.user.user-menu
		ul.dropdown-menu
			li.user-body
				a
					color: black !important
</style>
