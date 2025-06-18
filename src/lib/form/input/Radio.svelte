<script lang="ts">
	type Props = {
		id?: string;
		value?: string;
		name?: string;
		disabled?: boolean;
		group: any;
		level?: string;
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
		    level    = "primary",
		    children,
		    onClick = undefined,
		    ...restProps
	    }: Props = $props()
</script>

<div class="icheck-{level} {restProps.class || ''}">
	<input bind:group {value} {disabled} {id} {name} type="radio" onclick={onClick} />
	{@render children?.()}
</div>
