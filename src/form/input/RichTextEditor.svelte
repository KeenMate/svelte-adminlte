<script>
	import {onMount, createEventDispatcher, onDestroy} from "svelte"
	import Quill from "quill"
  import { imageResize } from 'quill-image-resize';
	import debounce from "lodash/debounce"
	Quill.register("module/imageResize", imageResize)

	export let value
	export let theme = "snow"
	export let options = {}
  export let DefaultToolbar = [
	[{font: []}, {size: []}],
	["bold", "italic", "underline", "strike"],
	[{color: []}, {background: []}],
	[{script: "super"}, {script: "sub"}],
	[{header: "1"}, {header: "2"}, "blockquote", "code-block"],
	[
		{list: "ordered"},
		{list: "bullet"},
		{indent: "-1"},
		{indent: "+1"}
	],
	["direction", {align: []}],
	["link", "image", "video", "formula"],
	["clean"]
];
	export let TypingDebounceDelay = 1000;

	const dispatch = createEventDispatcher()
	const inputDebounce = debounce(val => {
		value = val
	}, TypingDebounceDelay)
  

	let instance
	let element
	$: config = {
		theme,
		modules: {
			imageResize: {},
			toolbar: DefaultToolbar
		},
		...options
	}
	$: onValueChange(value, instance)
	onMount(() => {
		instance = new Quill(element, config)
		instance.on("editor-change", onEditorChange)
	})
	onDestroy(() => {
		if (!instance)
			return
		instance.off("editor-change", onEditorChange)
	})
	function onValueChange(val) {
		if (!instance)
			return
		if (instance.root.innerHTML === val)
			return
		instance.root.innerHTML = val || ""
	}
	function onEditorChange(eventName, ...args) {
		if (!instance)
			return
		if (eventName === "text-change") {
			if (args[2] !== "user")
				return
			const content = instance.root.innerHTML
			dispatch("input", content)
			inputDebounce(content)
		}
	}
</script>

<div class="quill-parent {$$restProps.class || ''}">
	<div bind:this={element}>
	</div>
</div>

<style lang="sass">
  :global
	  .ql-editor
      min-height: 40vh
	@import "css/quill.snow.css"


</style>