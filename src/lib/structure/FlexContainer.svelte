<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let row = false
	export let inline = false
	export let column = false
	export let justifyContent = null
	export let alignItems = null
	export let wrap = true
</script>

<div
	class="{justifyContent ? 'justify-content-' + justifyContent : ''} {alignItems
		? 'align-items-' + alignItems
		: ''} {$$props.class || ''}"
	class:row
	class:d-inline-flex={inline}
	class:d-flex={!inline}
	class:flex-wrap={wrap}
	class:flex-column={column}
>
	<slot />
</div>

<!-- <style>
.flex-container{
	display:flex;
	flex-wrap: wrap;
	gap: 0.3em;

}
</style> -->
