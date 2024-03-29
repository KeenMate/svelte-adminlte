<script>
	import "@fortawesome/fontawesome-free/css/all.css"
	import "icheck-bootstrap/icheck-bootstrap.css"
	import "admin-lte/build/scss/AdminLTE.scss"
	import "toastr/build/toastr.css"
	// import TopNavigation from "$lib/structure/navigation/TopNavigation.svelte"
	import {TopNavigation} from "$lib/index"
	import {Sidebar} from "$lib/index"
	import {SidebarNavItem} from "$lib/index"
	import {TopNavItem} from "$lib/index"
	import {InputGroup} from "$lib/index"
	import {InfoBox} from "$lib/index"
	import {SocialCard} from "$lib/index"

	const footerItems = [
		{title: "Projects", amount: 31},
		{title: "Tasks", amount: 12},
		{title: "Followers", amount: 3},
		{title: "Completed", amount: 2}
	]
</script>

<Sidebar>
	<SidebarNavItem>
		<InputGroup>
			<input
				class="form-control form-control-sidebar"
				type="search"
				placeholder="Search"
				aria-label="Search"
			/>
		</InputGroup>
	</SidebarNavItem>
	<SidebarNavItem>Dashboard</SidebarNavItem>
	<SidebarNavItem>Charts</SidebarNavItem>
	<SidebarNavItem>Forms</SidebarNavItem>
</Sidebar>

<TopNavigation>
	<TopNavItem>
		<a
			href=""
			style="color:gray;">Home</a
		>
	</TopNavItem>
	<TopNavItem>
		<a
			href=""
			style="color:gray;">Contact</a
		>
	</TopNavItem>
	<TopNavItem>
		<a
			href=""
			style="color:gray;">About Us</a
		>
	</TopNavItem>
</TopNavigation>

<div class="content-wrapper">
	<!-- <div style="min-height: 1345.6px; margin-left: 250px; background-color: #f4f6f9;"> -->
	<div class="content-header">
		<h2>Widgets</h2>
	</div>
	<div class="content">
		<h5 class="mb-2">Info Box</h5>
		<div class="row">
			<div class="col-md-3 col-sm-6 col-12">
				<InfoBox
					text="Messages"
					imageBackgroundColor="rgb(23, 162, 184)"
				>
					<div slot="image">
						<i
							class="far fa-envelope"
							style="color:white;"
						/>
					</div>

					<div slot="number">1234</div>
				</InfoBox>
			</div>
			<div class="col-md-3 col-sm-6 col-12">
				<InfoBox
					text="Bookmarks"
					imageBackgroundColor="#28a745"
				>
					<div slot="image">
						<i
							class="far fa-flag"
							style="color:white;"
						/>
					</div>

					<div slot="number">1234</div>
				</InfoBox>
			</div>
			<div class="col-md-3 col-sm-6 col-12">
				<InfoBox
					text="Uploads"
					imageBackgroundColor="#ffc107"
				>
					<div slot="image">
						<i class="far fa-copy" />
					</div>

					<div slot="number">1234</div>
				</InfoBox>
			</div>
			<div class="col-md-3 col-sm-6 col-12">
				<InfoBox
					text="Likes"
					imageBackgroundColor="#dc3545"
				>
					<div slot="image">
						<i
							class="far fa-star"
							style="color:white;"
						/>
					</div>

					<div slot="number">1234</div>
				</InfoBox>
			</div>
		</div>

		<h5 class="mb-2">Info Box with Custom Shadows</h5>
		<div class="row">
			<div class="col-md-3 col-sm-6 col-12">
				<InfoBox
					text="Messages"
					imageBackgroundColor="rgb(23, 162, 184)"
				>
					<div slot="image">
						<i
							class="far fa-envelope"
							style="color:white;"
						/>
					</div>

					<div slot="number">1234</div>
				</InfoBox>
			</div>
			<div class="col-md-3 col-sm-6 col-12">
				<InfoBox
					text="Bookmarks"
					imageBackgroundColor="#28a745"
					shadow="small"
				>
					<div slot="image">
						<i
							class="far fa-flag"
							style="color:white;"
						/>
					</div>

					<div slot="number">1234</div>
				</InfoBox>
			</div>
			<div class="col-md-3 col-sm-6 col-12">
				<InfoBox
					text="Uploads"
					imageBackgroundColor="#ffc107"
					shadow="regular"
				>
					<div slot="image">
						<i class="far fa-copy" />
					</div>
					<div slot="number">1234</div>
				</InfoBox>
			</div>
			<div class="col-md-3 col-sm-6 col-12">
				<InfoBox
					imageBackgroundColor="#dc3545"
					shadow="large"
					text="Likes"
				>
					<div slot="image">
						<i
							class="far fa-star"
							style="color:white;"
						/>
					</div>

					<div slot="number">1234</div>
				</InfoBox>
			</div>
		</div>

		<h5 class="mb-2">Info Box with bg-*</h5>
		<div class="row">
			<div class="col-md-3 col-sm-6 col-12">
				<InfoBox
					backgroundColor="rgb(23, 162, 184)"
					color="white"
					text="Bookmarks"
				>
					<div slot="image">
						<i
							class="far fa-bookmark"
							style="color:white;"
						/>
					</div>

					<div slot="number">1234</div>
				</InfoBox>
			</div>
			<div class="col-md-3 col-sm-6 col-12">
				<InfoBox
					backgroundColor="#28a745"
					color="white"
					shadow="small"
					text="Likes"
				>
					<div slot="image">
						<i
							class="far fa-thumbs-up"
							style="color:white;"
						/>
					</div>

					<div slot="number">1234</div>
				</InfoBox>
			</div>
			<div class="col-md-3 col-sm-6 col-12">
				<InfoBox
					backgroundColor="#ffc107"
					shadow="regular"
					icon="far fa-calendar-alt"
					text="Events"
				>
					<div slot="number">1234</div>
				</InfoBox>
			</div>
			<div class="col-md-3 col-sm-6 col-12">
				<InfoBox
					accent="danger"
					color="white"
					shadow="large"
					text="Comments"
				>
					<div slot="image">
						<i
							class="far fa-comments"
							style="color:white;"
						/>
					</div>
					<div slot="number">1234</div>
				</InfoBox>
			</div>
		</div>

		<h5 class="mb-2">Small Box</h5>
		<div class="row">
			<div class="col-lg-3 col-6">
				<InfoBox
					accent="info"
					backgroundColor="rgb(23, 162, 184)"
					color="white"
					shadow="regular"
					icon="fas fa-shopping-cart"
					smallBox="true"
					text="User Registrations"
				>
					<div slot="number">1234</div>
				</InfoBox>
			</div>
		</div>

		<div class="row">
			<div class="col-md-4">
				<SocialCard
					image="src\lib\images\image.png"
					username="Velky Borec"
					description="Lead Developer"
					{footerItems}
					badgeColor="primary"
					headerAccent="warning"
				>
				</SocialCard>
			</div>

			<div class="col-md-4">
				<SocialCard
					image="src\lib\images\image.png"
					username="Maly Borec"
					description="Lead Developer"
					{footerItems}
					headerAccent="info"
					horizontalLayout=true
				>
				</SocialCard>
			</div>

			<div class="col-md-4">
				<SocialCard
					image="src\lib\images\image.png"
					username="Maly Borec"
					description="Lead Developer"
					{footerItems}
					headerAccent="info"
					horizontalLayout=true
					headerAlign="right"
				>
				</SocialCard>
			</div>
		</div>
	</div>
</div>
