<script>
	export let color = "default"
	export let type = "button"
	export let toggle = null


	export let xsmall = false
	export let small = false
	export let large = false
	export let borderless = false
	export let outlined = false
	export let social = false
	export let link = false
	export let disabled = false
	export let app = false
	export let squared = false
</script>

<button
	class="btn btn-{outlined && 'outlined-' || ''}{color} btn-flat {$$props.class || ''}"
	class:btn-app={app}
	class:btn-flat={borderless}
	class:btn-lg={large}
	class:btn-link={link}
	class:btn-sm={small}
	class:btn-social={social}
	class:btn-xs={xsmall}
	class:disabled
	class:squared
	{type}
	data-toggle={toggle}
	{disabled}
	{...$$restProps}
	on:click
>
	<slot />
</button>

<style lang="sass">
	.squared
		display: inline-flex
		align-items: center
		justify-content: center

		width: 3rem
		height: 3rem
		padding: .1rem

		&:hover
			text-decoration: none
</style>
