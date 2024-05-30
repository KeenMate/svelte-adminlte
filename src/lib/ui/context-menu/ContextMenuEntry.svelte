<script lang="ts">
	export let color = null
</script>

<div
	class="context-menu-entry {color || ''} {$$restProps.class || ''}"
	on:click
	on:mouseenter
	on:mouseleave
>
	<slot />
</div>
