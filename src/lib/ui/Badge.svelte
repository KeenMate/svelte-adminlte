<script>
	export let color = ""
</script>

<span
	{...$$restProps}
	class="badge {(color && 'bg-' + color) || ''} {$$props.classes || ''}"
	on:click
>
	<slot />
</span>
