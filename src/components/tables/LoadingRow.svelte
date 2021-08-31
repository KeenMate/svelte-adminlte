<script>
	import TableRowFullWidth from "./TableRowFullWidth.svelte"
	import Loader from "../ui/Loader.svelte"
</script>

<TableRowFullWidth>
	<!--<h5 class="text-center">Loading data</h5>-->
	<div class="loader-parent">
		<div>
			<Loader />
		</div>
	</div>
</TableRowFullWidth>

<style lang="sass">

	.loader-parent
		display: flex
		justify-content: center
		align-items: center

		& > *
			width: 4rem
			height: 4rem
</style>
