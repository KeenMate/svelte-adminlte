<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
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
