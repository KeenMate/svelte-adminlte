<script lang="ts">
	/**
	 * @deprecated Use native `title` prop
	 */
	export let tooltip = ""
</script>

<a
	role="button"
	title={tooltip}
	{...$$restProps}
	class="dropdown-item {$$restProps.class || ''}"
	on:click
>
	<slot />
</a>

<style lang="sass">
	li
		&:hover
			cursor: pointer
</style>
