<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let text = false
</script>

<span class="input-group-append {$$props.class || ''}">
	{#if !text}
		<slot />
	{:else}
		<div class="input-group-text">
			<slot />
		</div>
	{/if}
</span>
