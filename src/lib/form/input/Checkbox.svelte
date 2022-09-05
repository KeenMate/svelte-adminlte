<script>
	export let checked = false;
	export let id = '';
	export let value = '';
	export let name = '';
	export let disabled = false;
	export let level = 'primary';
</script>

<div class="icheck-{level} d-flex align-items-center {$$props.class || ''}">
	<input {id} bind:checked {value} {disabled} type="checkbox" {name} on:click />
	<slot />
</div>

<style lang="scss">
	div {
		gap: .25rem
	}
</style>
