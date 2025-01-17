<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let row = false
</script>

<div class="form-group {$$props.class || ''}" class:row>
	<slot />
</div>
