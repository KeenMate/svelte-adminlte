<script lang="ts">
	type Props = {
		children?: import("svelte").Snippet;
	}

	let {children}: Props = $props()
</script>

<ul class="timeline">
	{@render children?.()}
</ul>
