<!-- @migration-task Error while migrating Svelte code: $$props is used together with named props in a way that cannot be automatically migrated. -->
<script lang="ts">
	export let form
	export let horizontal = false

	$: formParam = form || (() => {
	})
</script>

<form use:formParam class={$$props.class || ""} class:form-horizontal={horizontal} {...$$restProps}>
	<slot />
</form>
