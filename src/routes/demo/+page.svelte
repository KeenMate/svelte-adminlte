<script lang="ts">
	import "@fortawesome/fontawesome-free/css/all.css"
	import "icheck-bootstrap/icheck-bootstrap.css"
	import "admin-lte/build/scss/AdminLTE.scss"
	import "toastr/build/toastr.css"
	import TextInput from "$lib/form/input/TextInput.svelte"
	// import TopNavigation from "$lib/structure/navigation/TopNavigation.svelte"
	import {
		ButtonGroup,
		Card,
		Checkbox,
		CheckboxSimple,
		EmailInput,
		FileInput,
		Form,
		FormGroup,
		InputGroup,
		Label,
		LteButton,
		PasswordInput,
		RadioSimple,
		Select,
		Sidebar,
		SidebarNavItem,
		Textarea,
		TopNavigation,
		TopNavItem
	} from "$lib/index.js"

	const options = [
		{value: "option1", label: "Option 1"},
		{value: "option2", label: "Option 2"},
		{value: "aption3", label: "Aption 3"}
	]
	let selectedValue = ""
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
		<h2>General Form</h2>
	</div>
	<div class="content">
		<div class="row">
			<div class="col-md-6">
				<!-- <div class="col-sm-6"> -->

				<Card
					title="Quick Example"
					icon="fas fa-bars"
					headerBackgroundColor="#007bff"
					titleColor="white"
				>
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
					</Form>
					<svelte:fragment slot="footer">
						<ButtonGroup>
							<LteButton>Submit</LteButton>
						</ButtonGroup>
					</svelte:fragment>
				</Card>
				<!-- </div> -->

				<!-- <div class="col-sm-6"> -->
				<Card
					title="Different Styles"
					icon="fas fa-bars"
					headerBackgroundColor="#007bff"
					titleColor="white"
				>
					<h4>Input</h4>

					<FormGroup>
						<Label>Bottom Border only</Label>
						<code>.form-control-border</code>
						<TextInput
							placeholder=".form-control-border"
							style="border:none;border-bottom:1px solid gray;"
						/>
					</FormGroup>

					<FormGroup>
						<Label>Bottom Border only 2px Border</Label>
						<code>.form-control-border.border-width-2</code>
						<TextInput
							placeholder=".form-control-border"
							style="border:none;border-bottom:2px solid gray;"
						/>
					</FormGroup>

					<FormGroup>
						<Label>Flat</Label>
						<code>.rounded-0</code>
						<TextInput
							placeholder=".form-control-border"
							style="border-radius: 0;"
						/>
					</FormGroup>

					<h4>Custom Select</h4>

					<FormGroup>
						<Label>Bottom Border only</Label>
						<code>.form-control-border</code>
						<select
							class="custom-select"
							style="border:none;border-bottom:1px solid gray;"
						>
							<option>Option 1</option>
							<option>Option 2</option>
						</select>
					</FormGroup>

					<FormGroup>
						<Label>Bottom Border only 2px Border</Label>
						<code>.form-control-border.border-width-2</code>
						<select
							class="custom-select"
							style="border:none;border-bottom:2px solid gray;"
						>
							<option>Option 1</option>
							<option>Option 2</option>
						</select>
					</FormGroup>

					<FormGroup>
						<Label>Flat</Label>
						<code>.rounded-0</code>
						<select
							class="custom-select"
							style="border-radius: 0;"
						>
							<option>Option 1</option>
							<option>Option 2</option>
						</select>
					</FormGroup>
				</Card>
				<!-- </div> -->
			</div>
			<div class="col-md-6">
				<!-- <div class="col-sm-6"> -->
				<Card
					title="Different Height"
					icon="fas fa-bars"
					headerBackgroundColor="#28a745"
					titleColor="white"
				>
					<FormGroup>
						<TextInput
							placeholder=".form-control-lg"
							size="lg"
						/>
						<br />
						<TextInput placeholder="default" />
						<br />
						<TextInput
							placeholder=".form-control-sm"
							size="sm"
						/>
					</FormGroup>
				</Card>
				<!-- </div> -->

				<!-- <div class="col-sm-6"> -->
				<Card
					title="Different Width"
					icon="fas fa-bars"
					headerBackgroundColor="#dc3545"
					titleColor="white"
				>
					<FormGroup>
						<div class="row">
							<div class="col-3">
								<TextInput placeholder=".col-3" />
							</div>
							<div class="col-4">
								<TextInput placeholder=".col-4" />
							</div>
							<div class="col-5">
								<TextInput placeholder=".col-5" />
							</div>
						</div>
					</FormGroup>
				</Card>
				<!-- </div> -->

				<!-- <div class="col-sm-6"> -->
				<Card
					title="General Elements"
					icon="fas fa-bars"
					headerBackgroundColor="#ffc107"
				>
					<Form>
						<div class="row">
							<div class="col-sm-6">
								<FormGroup>
									<Label>Text</Label>
									<TextInput placeholder="Enter..." />
								</FormGroup>
							</div>
							<div class="col-sm-6">
								<FormGroup>
									<Label>Text</Label>
									<TextInput
										disabled="true"
										placeholder="Enter..."
									/>
								</FormGroup>
							</div>
						</div>

						<div class="row">
							<div class="col-sm-6">
								<FormGroup>
									<Label>Textarea</Label>
									<Textarea
										rows="3"
										placeholder="Enter..."
									/>
								</FormGroup>
							</div>
							<div class="col-sm-6">
								<Label>Textarea</Label>
								<Textarea
									disabled="true"
									rows="3"
									placeholder="Enter..."
								/>
							</div>
						</div>

						<FormGroup>
							<Label>Input with success</Label>
							<TextInput
								validity="valid"
								placeholder="Enter..."
							/>
						</FormGroup>

						<FormGroup>
							<Label>Input with warning</Label>
							<TextInput
								validity="warning"
								placeholder="Enter..."
							/>
						</FormGroup>

						<FormGroup>
							<Label>Input with error</Label>
							<TextInput
								validity="invalid"
								placeholder="Enter..."
							/>
						</FormGroup>

						<div class="row">
							<div class="col-sm-6">
								<FormGroup>
									<div class="form-check">
										<CheckboxSimple>Checkbox</CheckboxSimple>
									</div>
									<div class="form-check">
										<CheckboxSimple checked="true">Checkbox checked</CheckboxSimple>
									</div>
									<div class="form-check">
										<CheckboxSimple disabled="true">Checkbox disabled</CheckboxSimple>
									</div>
								</FormGroup>
							</div>

							<div class="col-sm-6">
								<FormGroup>
									<div class="form-check">
										<!-- <Radio
											group="x"
											name="abc"
											id="abc">Radio</Radio
										> -->
										<RadioSimple
											group="x"
											name="abc"
											id="abc"
										>
											<label for="abc">Radio</label>
										</RadioSimple>
									</div>

									<div class="form-check">
										<RadioSimple
											group="x"
											name="aabc"
											id="aabc"
											selected="true"
										>
											<label for="aabc">Radio selected</label>
										</RadioSimple>
									</div>

									<div class="form-check">
										<RadioSimple
											group="x"
											name="aaabc"
											id="aaabc"
											disabled="true"
										>
											<label for="aaabc">Radio disabled</label>
										</RadioSimple>
									</div>
								</FormGroup>
							</div>
						</div>

						<div class="row">
							<div class="col-sm-6">
								<FormGroup>
									<Label>Select</Label>
									<Select
										bind:this={selectedValue}
										{options}
										on:change
										searchBar
									/>
								</FormGroup>
							</div>
							<div class="col-sm-6">
								<!-- <FormGroup>
									<Label>Select Disabled</Label>
									<Select
										bind:value={selectedValue}
										{options}
										on:change={handleSelectChange}
										disabled
									
									/>
								</FormGroup> -->
							</div>
						</div>

						<div class="row">
							<div class="col-sm-6">
								<FormGroup>
									<Label>Select Multiple</Label>
									<Select
										{options}
										multiple

									/>
								</FormGroup>
							</div>

							<div class="col-sm-6">
								<FormGroup>
									<Label>Select Multiple Disabled</Label>
									<Select
										{options}
										multiple
										disabled
									/>
								</FormGroup>
							</div>
						</div>
					</Form>
				</Card>
				<!-- </div> -->
			</div>
		</div>
	</div>
</div>
