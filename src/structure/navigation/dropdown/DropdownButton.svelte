<script>
  export let href = "javascript:void(0)"
</script>

<a {href} on:click class="nav-link dropdown-toggle" role="button" data-toggle="dropdown" {...$$restProps}>
	<slot />
</a>
