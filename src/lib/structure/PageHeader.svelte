<script lang="ts">
	import {createEventDispatcher} from "svelte"
	import LteButton from "../ui/buttons/LteButton.svelte"

	const dispatch = createEventDispatcher()

	type Props = {
		showBackArrow?: boolean;
		children?: import("svelte").Snippet;
		breadcrumbs?: import("svelte").Snippet;
	}

	let {showBackArrow = false, children, breadcrumbs}: Props = $props()

	function backArrowClicked(event) {
		dispatch("backArrowClicked", event.detail)
	}
</script>

<div class="content-header">
	<div class="container-fluid">
		<div class="row mb-2">
			<div class="col-sm-6">
				{#if showBackArrow}
					<LteButton small link squared color="" onClick={backArrowClicked}>
						<i class="fas fa-arrow-left"></i>
					</LteButton>
				{/if}
				<h1>
					{@render children?.()}
				</h1>
			</div>

			<div class="col-sm-6">
				<ol class="breadcrumb float-sm-right">
					{@render breadcrumbs?.()}
				</ol>
			</div>
		</div>
	</div>
</div>

<style lang="sass">
	.content-header
		display: flex
		align-items: center
		column-gap: .2rem

		h1
			flex: 1

		ol
			float: none
			position: static
</style>
