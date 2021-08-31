<script>
	export let color = ""
	export let title = ""
</script>

<span class="label {color && 'label-' + color || ''} {$$props.classes || ''}" {title}>
	<slot />
</span>
