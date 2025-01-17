<script lang="ts">
	import { run } from 'svelte/legacy';

	import {createEventDispatcher} from "svelte"
	import CKEditor from "ckeditor5-svelte"
	import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document/build/ckeditor.js"

	const dispatch = createEventDispatcher()

	interface Props {
		value: string;
		disabled?: boolean;
		readonly?: boolean;
		id?: string;
		additionalConfig?: any;
		[key: string]: any
	}

	let {
		value,
		disabled = false,
		readonly = false,
		id = "ckEditorId",
		additionalConfig = {},
		...rest
	}: Props = $props();

	let editor = $state(DecoupledEditor)
	let editorInstance: any = $state(null)

	let localValue = $state("")
	let editorConfig: any = $state()

	run(() => {
		const tmpConfig: any = {...additionalConfig}
		if (readonly) {
			tmpConfig.toolbar = {items: []}
		}

		editorConfig = tmpConfig
	});

	run(() => {
		localValue = value
	});

	run(() => {
		editorInstance && (editorInstance.isReadOnly = disabled || readonly)
	});

	function onReady({detail: editor}: {detail: any}) {
		editorInstance = editor
		editor.ui
			.getEditableElement()
			.parentElement.insertBefore(editor.ui.view.toolbar.element, editor.ui.getEditableElement())
	}

	function onInput({detail: {data}}: {detail: {data: string}}) {
		dispatch("input", data)
	}
</script>

<main class={rest.parentClass}>
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
