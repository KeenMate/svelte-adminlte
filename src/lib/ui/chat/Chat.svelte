<script lang="ts">
	export let color = "primary"
</script>

<div class="direct-chat-messages {(color && `direct-chat-${color}`) || ''}">
	<slot />
</div>
