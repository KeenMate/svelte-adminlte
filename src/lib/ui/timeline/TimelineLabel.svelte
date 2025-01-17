<script lang="ts">
	interface Props {
		color?: string;
		children?: import('svelte').Snippet;
	}

	let { color = "default", children }: Props = $props();
</script>

<li class="time-label">
	<span class={(color && "bg-" + color) || ""}>
		{@render children?.()}
	</span>
</li>
