<script>
	export let inputId = null
</script>

<label class={$$props.class || ''} for={inputId}>
	<slot />
</label>
