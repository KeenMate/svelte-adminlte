<script lang="ts">
	import {_} from "svelte-i18n"

	type Props = {
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    children = undefined,
		    ...props
	    }: Props = $props()
</script>

<button
	type="button"
	data-dismiss="modal"
	{...props}
	class="btn btn-default btn-sm pull-left {props.class || ''}"
>
	{#if children}
		{@render children()}
	{:else}
		{$_("common.buttons.close")}
	{/if}
</button>
