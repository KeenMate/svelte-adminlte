<script lang="ts">
	export let size = "md"
</script>

<div class="input-group input-group-{size} {$$props.class || ''}">
	<slot />
</div>

<style lang="sass">
	.input-group
		width: 100%
</style>
