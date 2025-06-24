<script lang="ts">
	type Props = {
		id?: string;
		value?: any;
		name?: string;
		disabled?: boolean;
		group: any;
		children?: import("svelte").Snippet;
		onClick?: (ev: Event) => void

		[key: string]: any
	}

	let {
		    id       = "",
		    value    = "",
		    name     = "",
		    disabled = false,
		    group    = $bindable(),
		    children,
			onClick = undefined,
		    ...restProps
	    }: Props = $props()
</script>

<div class="{restProps.class || ''}">
	<input bind:group {value} {disabled} {id} {name} type="radio" onclick={onClick} />
	{@render children?.()}
</div>
