<script>
	export let form
	export let horizontal = false

	$: formParam = form || (() => {
	})
</script>

<form use:formParam class={$$props.class || ''} class:form-horizontal={horizontal} {...$$restProps}>
	<slot />
</form>
