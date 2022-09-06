<script>
	export let id
	export let value
	export let min
	export let max
</script>

<input
	bind:value
	type="range"
	class="custom-range {$$props.class || ''}"
	{id}
	{min}
	{max}
	on:input
	on:change
	on:focus
	on:blur
>
