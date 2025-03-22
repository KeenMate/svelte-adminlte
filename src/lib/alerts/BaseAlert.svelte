<script lang="ts">
	import {createEventDispatcher} from "svelte"

	const dispatch = createEventDispatcher()

	export let header: string | null | undefined = undefined
	export let closeable: boolean | undefined = undefined
	export let level: string | null | undefined = undefined
	export let icon: string | null | undefined = undefined

	function alertClosed() {
		dispatch("closed")
	}
</script>

<div
	{...$$restProps}
	class="alert alert-{level} {$$restProps.class || ''}"
	class:alert-dismissible={closeable}
>
	{#if closeable}
		<button
			type="button"
			class="close"
			data-dismiss="alert"
			aria-hidden="true"
			on:click={alertClosed}
		>
			×
		</button>
	{/if}

	<h4>
		<slot name="header">
			{#if header}
				<i class="icon {icon}" />
				{header}
			{/if}
		</slot>
	</h4>

	<slot />
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
