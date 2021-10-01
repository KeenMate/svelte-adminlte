<script>
</script>

<li class="nav-item dropdown">
	<a data-toggle="dropdown"
		aria-haspopup="true"
		aria-expanded="true"
		class="nav-link dropdown-toggle"
	>
		<slot name="title" />
	</a>
	<ul aria-labelledby="dropdownSubMenu1" class="dropdown-menu border-0 shadow">
		<slot />
	</ul>
</li>
