<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { children, ...rest }: Props = $props();
</script>

<li
	{...rest}
	class="nav-item dropdown {rest.class || ''}"
>
	{@render children?.()}
</li>
