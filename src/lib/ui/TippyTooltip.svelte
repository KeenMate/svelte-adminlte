<script lang="ts">
	import { run } from 'svelte/legacy';

	import tippy, {type Instance} from "tippy.js"
	import {onMount} from "svelte"

	interface Props {
		content: string;
		tippyOptions?: any;
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { content, tippyOptions = null, children, ...rest }: Props = $props();

	let rootElement: HTMLElement = $state()
	let tippyInstance: Instance = $state()

	run(() => {
		tippyInstance?.setContent(content || "")
	});
	run(() => {
		tippyOptions && tippyInstance?.setProps(tippyOptions)
	});

	onMount(() => {
		tippyInstance = tippy(rootElement)
	})
</script>

<div bind:this={rootElement} {...rest} class="tippy-parent {rest.class || ''}">
	{@render children?.()}
</div>

<style lang="scss">
	.tippy-parent {
		display: inline-block;
	}
</style>
