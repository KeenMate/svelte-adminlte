<script>
	import Loader from "../ui/Loader.svelte"

	export let color = "default"

	export let outline = false
	export let tabs = false
	export let outlineTabs = false
	export let noPadding = false
	export let loading = false
</script>

<div
	class="card card-{color} {$$props.class || ''}"
	class:card-outline={outline}
	class:card-outline-tabs={outlineTabs}
	class:card-tabs={tabs}
>
	{#if $$slots.header || $$slots.tools || $$slots.fullHeader}
		<div class="card-header {$$props.headerClass || ''}">
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
	<div class="card-body" class:p-0={noPadding}>
		<slot />
	</div>
	{#if $$slots.footer}
		<div class="card-footer">
			<slot name="footer" />
		</div>
	{/if}
	{#if loading}
		<div class="overlay">
			<!--<i class="fas fa-2x fa-sync-alt fa-spin"></i>-->
			<div class="loader-parent" style="height: 100%">
				<div>
					<Loader />
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- <style lang="sass">
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

</style> -->
