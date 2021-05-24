<script>
	export let color = "default"
</script>

<div class="callout callout-{color}">
	{#if $$slots.header}
		<h4><slot name="header" /></h4>
	{/if}
	{#if $$slots.default}
		<p>
			<slot />
		</p>
	{/if}
</div>
