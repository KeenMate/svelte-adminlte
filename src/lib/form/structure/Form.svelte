<script lang="ts">
	type Props = {
		form: any;
		horizontal?: boolean;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {form, horizontal = false, children, ...restProps}: Props = $props()

	let formParam = $derived(form || (() => {
	}))
</script>

<form use:formParam class={restProps.class || ""} class:form-horizontal={horizontal} {...restProps}>
	{@render children?.()}
</form>
