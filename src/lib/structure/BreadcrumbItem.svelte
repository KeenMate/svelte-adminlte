<script lang="ts">
	type Props = {
		active?: boolean;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {active = false, children, ...restProps}: Props = $props()
</script>

<li class="breadcrumb-item" class:active {...restProps}>
	{@render children?.()}
</li>
