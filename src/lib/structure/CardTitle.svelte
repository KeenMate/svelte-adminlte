<script lang="ts">
	export let color: string | null | undefined = undefined
</script>

<h3
	{...$$restProps}
	class="card-title {$$restProps.class || ''}"
	style:--color={color}
>
	<slot />
</h3>

<style lang="scss">
	h3 {
		color: var(--color);
	}
</style>
