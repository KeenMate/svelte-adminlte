<script>
	export let textCenter = false;
</script>

<div class="info-box">
	<span class="info-box-icon bg-transparent">
		<slot name="image" />
	</span>
	<div class="info-box-content" class:text-center-aligned={textCenter}>
		<span class="info-box-text">
			<slot />
		</span>
		{#if $$slots.number}
			<div class="info-box-number">
				<slot name="number" />
			</div>
		{/if}
	</div>
</div>

<style lang="sass">
	.info-box-icon
		display: flex
		align-items: center
		justify-content: center

	.info-box-content.text-center-aligned
		display: flex
		justify-content: center
		align-items: center
		min-height: 90px


</style>
