<script lang="ts">
	import {run} from "svelte/legacy"

	import tippy, {type Instance} from "tippy.js"
	import {onMount} from "svelte"

	type Props = {
		content: string;
		tippyOptions?: any;
		children?: import("svelte").Snippet;

		[key: string]: any
	}

	let {content, tippyOptions = null, children, ...restProps}: Props = $props()

	let rootElement: HTMLElement = $state()
	let tippyInstance: Instance  = $state()

	run(() => {
		tippyInstance?.setContent(content || "")
	})
	run(() => {
		tippyOptions && tippyInstance?.setProps(tippyOptions)
	})

	onMount(() => {
		tippyInstance = tippy(rootElement)
	})
</script>

<div bind:this={rootElement} {...restProps} class="tippy-parent {restProps.class || ''}">
	{@render children?.()}
</div>

<style lang="scss">
	.tippy-parent {
		display: inline-block;
	}
</style>
