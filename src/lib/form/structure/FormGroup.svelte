<script lang="ts">
	type Props = {
		row?: boolean;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {row = false, children, ...restProps}: Props = $props()
</script>

<div class="form-group {restProps.class || ''}" class:row>
	{@render children?.()}
</div>
