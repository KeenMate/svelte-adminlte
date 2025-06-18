<script lang="ts">
	import LteButton from "../buttons/LteButton.svelte"

	type Props = {
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {...props}: Props = $props()
</script>

<LteButton
	toggle="dropdown"
	aria-expanded="false"
	{...props}
	class="dropdown-toggle {props.class || ''}"
>
	{@render props.children?.()}
	<!--<span class="caret"></span>-->
</LteButton>
