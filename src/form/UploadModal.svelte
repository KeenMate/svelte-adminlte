<script>
	import {createEventDispatcher, onMount} from "svelte"
	import {DashboardModal} from "@uppy/svelte"
	import Uppy from "@uppy/core"
	import XHRUpload from "@uppy/xhr-upload"
	import "@uppy/core/dist/style.css"
	import "@uppy/dashboard/dist/style.css"

	const dispatch = createEventDispatcher()

	export let maxFileSize = "1000000000" // 1GB
	export let allowedFileTypes = null
	export let maxNumberOfFiles = null
	export let simultaneousUploads = 2
	export let fieldName = "file"
	export let endpoint = (() => {
		throw new Error("Endpoint prop of upload modal is required")
	})()
	export let uploadData = {}
	export let uppyOptions = null

	export const uppy = new Uppy({
		restrictions: {
			maxFileSize,
			allowedFileTypes
		}
	})
		// .use(Dashboard)
		.use(XHRUpload, {
			endpoint,
			fieldName,
			limit: simultaneousUploads
		})

	let open = false

	$: uppy.setMeta(uploadData)

	$: uppy.setOptions({
		restrictions: {
			maxNumberOfFiles,
			maxFileSize,
			allowedFileTypes
		},
		...(uppyOptions || {})
	})

	$: uppy.getPlugin("XHRUpload").setOptions({
		endpoint,
		fieldName,
		limit: simultaneousUploads
	})

	export function openModal() {
		open = true
	}

	export function closeModal() {
		open = false
	}

	onMount(() => {
		initUppy()
	})

	function initUppy() {
		uppy.on("complete", result => {
			dispatch("uploadCompleted", result)
		})

		uppy.on("upload-success", (file, response) => {
			dispatch("uploadSuccessful", {file, response})
			// do something with file and response
		})
		uppy.on("upload-error", (file, error, response) => {
			dispatch("uploadError", {file, error, response})
		})
		uppy.on("dashboard:modal-closed", () => {
			open = false
			dispatch("modalClosed")
		})
	}
</script>

<DashboardModal
	{uppy}
	{open}
	props={{closeModalOnClickOutside: true}}
/>
