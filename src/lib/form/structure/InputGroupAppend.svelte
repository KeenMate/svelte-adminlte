<script lang="ts">
	type Props = {
		text?: boolean;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {text = false, children, ...restProps}: Props = $props()
</script>

<span class="input-group-append {restProps.class || ''}">
	{#if !text}
		{@render children?.()}
	{:else}
		<div class="input-group-text">
			{@render children?.()}
		</div>
	{/if}
</span>
