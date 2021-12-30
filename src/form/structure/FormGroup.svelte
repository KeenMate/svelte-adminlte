<script>
	export let row = false;
</script>

<div class:row={row} class="form-group {$$props.class || ''}">
	<slot />
</div>
