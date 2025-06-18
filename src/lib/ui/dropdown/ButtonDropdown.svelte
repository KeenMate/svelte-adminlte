<script lang="ts">
	type Props = {
		xPlacement?: any;
		children?: import("svelte").Snippet;
	}

	let {xPlacement = null, children}: Props = $props()
</script>

<div class="dropdown-menu" role="menu" x-placement={xPlacement || "top-start"}>
	{@render children?.()}
</div>
