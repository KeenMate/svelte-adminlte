<div class="narrow-column-container">
	<slot />
</div>

<style lang="sass">
	:global
		.narrow-column-container
			display: flex
			column-gap: .5rem

			& > *:not(.small)
				flex: 1
</style>
