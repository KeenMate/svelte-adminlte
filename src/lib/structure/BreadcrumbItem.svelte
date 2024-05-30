<script lang="ts">
	export let active = false
</script>

<li class="breadcrumb-item" class:active {...$$restProps}>
	<slot />
</li>
