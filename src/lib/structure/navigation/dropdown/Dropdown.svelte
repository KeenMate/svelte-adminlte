<script lang="ts">
	type Props = {
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {children, ...restProps}: Props = $props()
</script>

<li
	{...restProps}
	class="nav-item dropdown {restProps.class || ''}"
>
	{@render children?.()}
</li>
