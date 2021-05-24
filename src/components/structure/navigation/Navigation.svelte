<script>
	import {createEventDispatcher} from "svelte"
	import {LogoutPath} from "../../../constants/urls"
	import MobileNavToggle from "./MobileNavToggle.svelte"
	import BrandNavLogo from "./BrandNavLogo.svelte"


	export let darkTheme = false
	export let displayName = ""

	const dispatch = createEventDispatcher()

	function onToggleTheme(ev) {
		ev.preventDefault()

		dispatch("toggleTheme")
	}

	function logout() {
		window.location.replace(LogoutPath);
	}
</script>

<header class="main-header">
	<nav class="navbar navbar-static-top">
		<div class="container">
			<div class="navbar-header">
				<BrandNavLogo />
				<MobileNavToggle />
			</div>

			<div class="collapse navbar-collapse pull-left" id="navbar-collapse">
				<ul class="nav navbar-nav">
					<li>
						<a href="#/">Route 1</a>
					</li>
				</ul>
			</div>

			<div class="navbar-custom-menu">
				<ul class="nav navbar-nav">
					<li class="dropdown user user-menu">
						<a href="#" class="dropdown-toggle" data-toggle="dropdown">
							<span>{displayName}</span>
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
								</div>
								<!-- /.row -->
							</li>
							<!-- Menu Footer-->
							<li class="user-footer">
								<div class="pull-left">
									<a href="javascript:void(0);" class="btn btn-default btn-flat">
										{displayName}
									</a>
								</div>
								<div class="pull-right">
									<a on:click={logout} class="btn btn-default btn-flat">Odhlásit</a>
								</div>
							</li>
						</ul>
					</li>
				</ul>
			</div>
		</div>
	</nav>
</header>

<style lang="sass">
	header
		nav
			ul.nav.navbar-nav
				li.dropdown.user.user-menu
					ul.dropdown-menu
						li.user-body
							a
								color: black !important

</style>
