<script lang="ts">
	type Props = {
		id?: string;
		value?: any;
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
		    children = undefined,
		    onClick = undefined,
		    ...restProps
	    }: Props = $props()
</script>

<div class="icheck-{level} {restProps.class || ''}">
	<input bind:group {value} {disabled} {id} {name} type="radio" onclick={onClick} />
	<label for={id}>
		{@render children?.()}
	</label>
</div>
