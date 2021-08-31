<script>
	export let noPadding = false
</script>

<div class="box box-warning">
	{#if $$slots.header || $$slots.tools || $$slots.fullHeader}
		<div class="box-header with-border">
			{#if $$slots.fullHeader}
				<slot name="fullHeader" />
			{:else}
				<h3 class="box-title">
					<slot name="header" />
				</h3>
				<div class="box-tools pull-right">
					<slot name="tools" />
				</div>
			{/if}
		</div>
	{/if}
	<div class="box-body" class:no-padding={noPadding}>
		<slot />
	</div>
	{#if $$slots.footer}
		<div class="box-footer">
			<slot name="footer" />
		</div>
	{/if}
</div>

<style lang="sass">
	.box
		border-top-color: #d45f5c
		background-color: #f9f9f9

		&.bg-dark
			background-color: #494949
			color: white !important

			a
				color: white !important

		.box-footer
			padding: .5rem 1rem
			background-color: #f9f9f9

			&:empty
				padding: 0

</style>
