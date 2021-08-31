<script>
	export let text = ""
	export let color = null
</script>

<div class="btn-group">
	<button type="button" class="btn btn-{color || 'default'} btn-flat dropdown-toggle btn-xs" data-toggle="dropdown">
		<span>{text}</span>
		<span class="caret"></span>
	</button>
	<ul class="dropdown-menu" role="menu">
		<slot />
	</ul>
</div>
