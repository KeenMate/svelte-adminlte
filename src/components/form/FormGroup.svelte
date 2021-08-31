<script>
	export let id = ""
	export let hideLabel = false
</script>

<div class="form-group" on:click>
	{#if $$slots.label && !hideLabel}
		<label for="{id}">
			<slot name="label" />
		</label>
	{/if}
	<slot />
</div>
