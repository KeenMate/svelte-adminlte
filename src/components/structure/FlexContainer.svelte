<script>
	export let row = false;
</script>

<div class:row={row} class="flex-container {$$props.class || ''}">
	<slot />
</div>

<style>
.flex-container{
	display:flex;
	flex-wrap: wrap;
	gap: 0.3em;
	
}
</style>
