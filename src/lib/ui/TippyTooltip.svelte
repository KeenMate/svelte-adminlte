<script lang="ts">
    import tippy, {type Instance} from "tippy.js"
  import {onMount} from "svelte"

  export let content: string
  export let tippyOptions: any

  let rootElement: HTMLElement
  let tippyInstance: Instance
    
  $: tippyInstance?.setContent(content || "")
  $: tippyOptions && tippyInstance?.setProps(tippyOptions)

  onMount(() => {
    tippyInstance = tippy(rootElement)
  })
</script>

<div
	bind:this={rootElement}
	{...$$restProps}
	class="tippy-parent {$$restProps.class || ''}"
>
	<slot></slot>
</div>

<style lang="scss">
  .tippy-parent {
    display: inline-block;
  }
</style>
