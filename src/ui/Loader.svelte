<div class="loader-parent" {...$$props}>
	<div>
		<div class="lds-dual-ring center-block"></div>
	</div>
</div>

<style lang="sass">
	.loader-parent
		display: flex
		justify-content: center
		align-items: center
		height: 100%
		//min-height: 60vh

		& > div
			width: 4rem
			height: 4rem

			.center-block
				display: block !important


			.lds-dual-ring
				display: inline-block
				width: 100%
				height: 100%

				&::after
					content: " "
					display: block
					width: 75%
					height: 75%
					margin: 4px
					border-radius: 50%
					border: 2px solid
					border-color: rgb(255, 204, 0) transparent rgb(221, 45, 14) transparent
					animation: lds-dual-ring 0.8s ease-in-out infinite

	@keyframes lds-dual-ring
		0%
			transform: rotate(0deg)

		100%
			transform: rotate(360deg)


</style>
