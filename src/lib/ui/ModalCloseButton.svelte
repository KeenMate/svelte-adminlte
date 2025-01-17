<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { ...props }: Props = $props();
</script>

<button
	type="button"
	data-dismiss="modal"
	{...props}
	class="btn btn-default btn-sm pull-left {props.class || ''}"
>
	{#if children}{@render props.children()}{:else}Close{/if}
</button>
