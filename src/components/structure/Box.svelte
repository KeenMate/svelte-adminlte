<script>
	import darkTheme from "../../stores/dark-theme"

	export let noPadding = false
</script>

<div
	class="box box-warning"
	class:bg-dark={$darkTheme}
	style="opacity: {$darkTheme && '.9' || '1'}"
>
	{#if $$slots.header || $$slots.tools}
		<div class="box-header with-border">
			<h3 class="box-title">
				<slot name="header"/>
			</h3>
			<div class="box-tools pull-right">
				<slot name="tools"/>
			</div>
		</div>
	{/if}
	<div class="box-body" class:no-padding={noPadding}>
		<slot/>
	</div>
	{#if $$slots.footer}
		<div class="box-footer" class:bg-gray-active={$darkTheme}>
			<slot name="footer"/>
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

</style>
