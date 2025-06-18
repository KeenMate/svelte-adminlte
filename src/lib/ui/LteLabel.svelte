<script lang="ts">
	type Props = {
		color?: string;
		title?: string;
		classes?: string;
		children?: import("svelte").Snippet;
	}

	let {
		    color   = "",
		    title   = "",
		    classes = "",
		    children
	    }: Props = $props()
</script>

<span class="label {(color && 'label-' + color) || ''} {classes || ''}" {title}>
	{@render children?.()}
</span>
