<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let id = ""
	export let value = ""
	export let name = ""
	export let disabled = false
	export let group
	export let level = "primary"
</script>

<div class="icheck-{level} {$$props.class || ''}">
	<input bind:group {value} {disabled} {id} {name} type="radio" on:click />
	<slot />
</div>
