<script lang="ts">
	type Props = {
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {...props}: Props = $props()
</script>

<ul class="nav nav-tabs {props.class || ''}">
	{@render props.children?.()}
</ul>
