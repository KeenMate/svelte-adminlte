<script>
	import "@fortawesome/fontawesome-free/css/all.css"
	import "icheck-bootstrap/icheck-bootstrap.css"
	import "admin-lte/build/scss/AdminLTE.scss"
	import "toastr/build/toastr.css"
	import TextInput from "$lib/form/input/TextInput.svelte"
	// import TopNavigation from "$lib/structure/navigation/TopNavigation.svelte"
	import {TopNavigation} from "$lib/index"
	import {Sidebar} from "$lib/index"
	import {SidebarNavItem} from "$lib/index"
	import {TopNavItem} from "$lib/index"
	import {Form} from "$lib/index"
	import {Label} from "$lib/index"
	import {Card} from "$lib/index"
	import {EmailInput} from "$lib/index"
	import {PasswordInput} from "$lib/index"
	import {FileInput} from "$lib/index"
	import {Checkbox} from "$lib/index"
	import {LteButton} from "$lib/index"
	import {ButtonGroup} from "$lib/index"
	import {InputGroup} from "$lib/index"
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

<div style="min-height: 1345.6px; margin-left: 250px; background-color: #f4f6f9;">
	<div class="col-sm-6">
		<h2>General Form</h2>

		<Card title="Testovaci" icon="fas fa-bars">
		<!-- <svelte:fragment slot="header">
			<h2 class="card-title">Custom Header</h2>
		</svelte:fragment> -->

			<Form>
				<Label>Email</Label>
				<EmailInput placeholder="Email" />

				<Label>Password</Label>
				<PasswordInput placeholder="Password" />

				<Label>File input</Label>
				<FileInput />

				<Checkbox>Check me out</Checkbox>
				<ButtonGroup>
					<LteButton>Submit</LteButton>
				</ButtonGroup>
			</Form>
		</Card>
	</div>
</div>
