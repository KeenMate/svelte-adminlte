<script lang="ts">
	interface Props {
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { ...props }: Props = $props();
</script>

<tr>
	<td colspan="100" class={props.class || ""}>
		{@render props.children?.()}
	</td>
</tr>
