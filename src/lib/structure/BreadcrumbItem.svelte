<script lang="ts">
	interface Props {
		active?: boolean;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { active = false, children, ...rest }: Props = $props();
</script>

<li class="breadcrumb-item" class:active {...rest}>
	{@render children?.()}
</li>
