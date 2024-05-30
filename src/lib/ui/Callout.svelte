<script lang="ts">
	export let color = "default"
</script>

<div class="callout callout-{color} {$$props.class || ''}">
	<slot />
</div>
