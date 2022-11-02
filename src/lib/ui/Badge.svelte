<script>
	export let color = ""
</script>

<span class="badge {(color && 'bg-' + color) || ''} {$$props.classes || ''}" on:click>
	<slot />
</span>
