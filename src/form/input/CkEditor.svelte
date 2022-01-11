<script>
	import {createEventDispatcher} from "svelte"
	import CKEditor from "ckeditor5-svelte"
	import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document/build/ckeditor"

	const dispatch = createEventDispatcher()

	export let value
	export let disabled = false
	export let readonly = false
	export let id = "ckEditorId"
	export let toolbar = null

	let editor = DecoupledEditor
	let editorInstance = null

	let localValue = ""
	let editorConfig

	$: {
		const tmpConfig = {}
		if (toolbar)
			tmpConfig.toolbar = toolbar
		if (readonly)
			tmpConfig.toolbar = {items: []}

		editorConfig = tmpConfig
	}

	$: localValue = value

	$: editorInstance && (editorInstance.isReadOnly = disabled || readonly)

	function onReady({detail: editor}) {
		editorInstance = editor
		editor.ui
			.getEditableElement()
			.parentElement.insertBefore(
			editor.ui.view.toolbar.element,
			editor.ui.getEditableElement()
		)
	}

	function onInput({detail: {data}}) {
		dispatch("input", data)
	}
</script>

<main>
	<div {id}>
		<CKEditor
			bind:config={editorConfig}
			bind:editor
			bind:value={localValue}
			on:input={onInput}
			on:ready={onReady}
		/>

		<span style="display: none">
			{value}
		</span>
	</div>
</main>

<style lang="sass">
	:global(.ck.ck-content)
		background-color: white !important
		min-height: 15rem
</style>
