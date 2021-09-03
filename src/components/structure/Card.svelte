<script>
	export let noPadding = false
</script>

<div class="card card-warning">
	{#if $$slots.header || $$slots.tools || $$slots.fullHeader}
		<div class="card-header with-border">
			{#if $$slots.fullHeader}
				<slot name="fullHeader" />
			{:else}
				<h3 class="card-title">
					<slot name="header" />
				</h3>
				<div class="card-tools pull-right">
					<slot name="tools" />
				</div>
			{/if}
		</div>
	{/if}
	<div class="card-body" class:no-padding={noPadding}>
		<slot />
	</div>
	{#if $$slots.footer}
		<div class="card-footer">
			<slot name="footer" />
		</div>
	{/if}
</div>

<style lang="sass">
	.card
		border-top-color: #d45f5c
		background-color: #f9f9f9

		&.bg-dark
			background-color: #494949
			color: white !important

			a
				color: white !important

		.card-footer
			padding: .5rem 1rem
			background-color: #f9f9f9

			&:empty
				padding: 0

</style>
