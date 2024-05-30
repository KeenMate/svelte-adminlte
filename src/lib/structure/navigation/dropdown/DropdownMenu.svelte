<script lang="ts">
	export let right = false
	export let large = false
</script>

<div class="dropdown-menu" class:dropdown-menu-lg={large} class:dropdown-menu-right={right}>
	<slot />
</div>
