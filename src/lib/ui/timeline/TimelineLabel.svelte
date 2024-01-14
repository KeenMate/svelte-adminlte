<script>
	export let color = "default"
</script>

<li class="time-label">
	<span class={(color && "bg-" + color) || ""}>
		<slot />
	</span>
</li>
