<script>
	export let xPlacement
</script>

<div
	class="dropdown-menu"
	role="menu"
	x-placement={xPlacement || "top-start"}
>
	<slot />
</div>
