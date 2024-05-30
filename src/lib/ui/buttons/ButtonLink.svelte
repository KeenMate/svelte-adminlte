<script lang="ts">
	export let href: string
	export let target: string | null = null
	export let color: string | null  = null
	export let toggle: string | null = null
	export let xsmall                = false
	export let small                 = false
	export let large                 = false
	export let borderless            = false
	export let outlined              = false
	export let social                = false
	export let link                  = false
	export let disabled              = false
	export let app                   = false
	export let squared               = false
	export let icon: string | null   = null

	$: buttonClass = "btn-" + ((outlined && "outline-") || "") + (color || "default")
</script>

<a
	{href}
	{target}
	class:btn-app={app}
	class:btn-flat={borderless}
	class:btn-lg={large}
	class:btn-link={link}
	class:btn-sm={small}
	class:btn-social={social}
	class:btn-xs={xsmall}
	class:disabled
	class:squared
	data-toggle={toggle || null}
	{...$$restProps}
	class="btn btn-flat {!link ? buttonClass : ''} {$$restProps.class || ''}"
	on:click
>
	{#if icon}
		<i class={icon} />
	{/if}
	<slot />
</a>

<style lang="scss">
	.squared {
		display: inline-flex;
		align-items: center;
		justify-content: center;

		width: 3rem;
		height: 3rem;
		padding: 0.1rem;

		&:hover {
			text-decoration: none;
		}
	}
</style>
