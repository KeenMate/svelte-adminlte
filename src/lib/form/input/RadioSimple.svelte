<script lang="ts">
	export let id       = ""
	export let value    = ""
	export let name     = ""
	export let disabled = false
	export let group
</script>

<div class="{$$props.class || ''}">
	<input bind:group {value} {disabled} {id} {name} type="radio" on:click />
	<slot />
</div>
