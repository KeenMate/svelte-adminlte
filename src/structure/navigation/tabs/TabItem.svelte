<script>
	export let active = false
</script>

<li class="nav-item {$$props.class || ''}" role="presentation" on:click>
	<a
		class="nav-link"
		class:active
		href="javascript:void(0)" {...$$restProps}
	>
		<slot />
	</a>
</li>

<!-- <style lang="sass">
	li[role="presentation"]
		//border-radius: 0
		border: 1px solid #ddd

		&.active
			border-bottom-color: #f9f9f9 !important

		a
			//background-color: #00c0ef
			border: none
			border-radius: 0
			padding: .5rem
			margin-right: 0px

</style> -->
