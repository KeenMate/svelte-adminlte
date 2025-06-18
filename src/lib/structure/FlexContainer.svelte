<script lang="ts">
	type Props = {
		row?: boolean;
		inline?: boolean;
		column?: boolean;
		justifyContent?: any;
		alignItems?: any;
		wrap?: boolean;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {
		    row            = false,
		    inline         = false,
		    column         = false,
		    justifyContent = null,
		    alignItems     = null,
		    wrap           = true,
		    children,
		    ...restProps
	    }: Props = $props()
</script>

<div
	class="{justifyContent ? 'justify-content-' + justifyContent : ''} {alignItems
		? 'align-items-' + alignItems
		: ''} {restProps.class || ''}"
	class:row
	class:d-inline-flex={inline}
	class:d-flex={!inline}
	class:flex-wrap={wrap}
	class:flex-column={column}
>
	{@render children?.()}
</div>

<!-- <style>
.flex-container{
	display:flex;
	flex-wrap: wrap;
	gap: 0.3em;

}
</style> -->
