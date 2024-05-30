<script lang="ts">
	export let href: string | null = null
	export let visibility          = "d-none d-sm-inline-block"
</script>

<li
	{...$$restProps}
	class="nav-item {visibility} {$$props.class || ''}"
>
	<a class="nav-link" {href} on:click>
		<slot />
	</a>
</li>

<style lang="scss">
	.nav-link {
		line-height: 1.5rem;
	}
</style>
