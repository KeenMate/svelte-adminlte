<script lang="ts">
	export let text: string | null = null
</script>

<span class="input-group-prepend {$$props.class || ''}">
	{#if !text}
		<slot />
	{:else}
		<div class="input-group-text">
			<slot />
		</div>
	{/if}
</span>
