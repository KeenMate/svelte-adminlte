<script lang="ts">
	export let row = false
</script>

<div class="form-group {$$props.class || ''}" class:row>
	<slot />
</div>
