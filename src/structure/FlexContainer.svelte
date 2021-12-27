<script>
	export let row = false;
	export let inline = false;
	export let collumn = false;
	export let justifyContent = null;
	export let alignItems = null;

</script>

<div  class:row={row} class="flex-wrap {inline ? "d-inline-flex" : "d-flex"} {justifyContent ? "justify-content-" + justifyContent : ""} {alignItems ? "align-items-" + alignItems : ""}{$$props.class || ''}" class:flex-column={collumn}>
	<slot />
</div>

<!-- <style>
.flex-container{
	display:flex;
	flex-wrap: wrap;
	gap: 0.3em;
	
}
</style> -->
