<script lang="ts">
	import {createEventDispatcher} from "svelte"

	const dispatch = createEventDispatcher()

	type Props = {
		headerText?: string | null | undefined;
		closeable?: boolean | undefined;
		level?: string | null | undefined;
		icon?: string | null | undefined;
		header?: import("svelte").Snippet;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    headerText = undefined,
		    closeable  = undefined,
		    level      = undefined,
		    icon       = undefined,
		    header,
		    children,
		    ...restProps
	    }: Props = $props()

	function alertClosed() {
		dispatch("closed")
	}
</script>

<div
	{...restProps}
	class="alert alert-{level} {restProps.class || ''}"
	class:alert-dismissible={closeable}
>
	{#if closeable}
		<button
			type="button"
			class="close"
			data-dismiss="alert"
			aria-hidden="true"
			onclick={alertClosed}
		>
			×
		</button>
	{/if}

	<h4>
		{#if header}{@render header()}{:else}
			{#if headerText}
				<i class="icon {icon}"></i>
				{headerText}
			{/if}
		{/if}
	</h4>

	{@render children?.()}
</div>

<style lang="scss">
	.alert {
		h4 {
			&:empty {
				display: none;
			}
		}
	}
</style>
