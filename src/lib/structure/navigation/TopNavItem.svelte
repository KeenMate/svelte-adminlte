<script>
	export let href = null
	export let visibility = "d-none d-sm-inline-block"
</script>

<li class="nav-item {visibility} {$$props.class || ''}">
	<a class="nav-link" {href} on:click>
		<slot />
	</a>
</li>
