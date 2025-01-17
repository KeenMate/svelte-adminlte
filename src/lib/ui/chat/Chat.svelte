<script lang="ts">
	interface Props {
		color?: string;
		children?: import('svelte').Snippet;
	}

	let { color = "primary", children }: Props = $props();
</script>

<div class="direct-chat-messages {(color && `direct-chat-${color}`) || ''}">
	{@render children?.()}
</div>
