<script>
	export let color = null;
</script>

<div
	class="context-menu-entry {color || ''}"
	on:click
	on:mouseenter
	on:mouseleave
>
	<slot />
</div>

<style lang="sass">
	:global
		.context-menu-entry
			padding: .3rem .75rem
			min-width: 15rem

			&:not(:last-child)
				border-bottom: 1px solid #ebebeb

			&:hover
				background-color: #ebebeb
				cursor: pointer

			&.danger
				background-color: #d73925
				color: white

			&.success
				background-color: #00a65a
				color: white

			&.info
				background-color: #00c0ef
				color: white
</style>
