<script lang="ts">
	export let right = false
	export let large = false
	export let isSubmenu = false
</script>

<div
	class="dropdown-{isSubmenu ? 'sub' : ''}menu"
	class:dropdown-menu-lg={large} class:dropdown-menu-right={right}
>
	<slot />
</div>
