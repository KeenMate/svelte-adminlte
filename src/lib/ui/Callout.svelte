<script lang="ts">
	type Props = {
		color?: string;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {color = "default", children, ...restProps}: Props = $props()
</script>

<div class="callout callout-{color} {restProps.class || ''}">
	{@render children?.()}
</div>
