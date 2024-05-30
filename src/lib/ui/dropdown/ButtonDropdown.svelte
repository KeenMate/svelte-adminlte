<script lang="ts">
	export let xPlacement = null
</script>

<div class="dropdown-menu" role="menu" x-placement={xPlacement || "top-start"}>
	<slot />
</div>
