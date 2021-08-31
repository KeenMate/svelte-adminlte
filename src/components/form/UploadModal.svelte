<script>
	import {createEventDispatcher} from "svelte"
	import {get} from "svelte/store"
	import {DashboardModal} from "@uppy/svelte"
	import Uppy from "@uppy/core"
	import Dashboard from "@uppy/dashboard"
	import XHRUpload from "@uppy/xhr-upload"
	import "../../../node_modules/@uppy/core/dist/style.css"
	import "../../../node_modules/@uppy/dashboard/dist/style.css"
	import toastr from "../../helpers/toastr-helpers"
	import uppyLocale from "../../constants/uppy-locale"

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

	let open = false

	const uppy = new Uppy({
		restrictions: {
			maxFileSize,
			allowedFileTypes
		}
	})
		// .use(Dashboard)
		.use(XHRUpload, {
			endpoint,
			fieldName,
			locale: uppyLocale,
			limit: simultaneousUploads
		})

	$: uppy.setMeta(uploadData)

	$: uppy.setOptions({
		restrictions: {
			maxNumberOfFiles,
			maxFileSize,
			allowedFileTypes
		}
	})

	$: uppy.getPlugin("XHRUpload").setOptions({
		endpoint,
		fieldName,
		locale: uppyLocale,
		limit: simultaneousUploads
	})

	uppy.on("complete", (result) => {
		console.log("Upload complete! Upload result: ", result)

		if (!result.failed.length)
			toastr.success("Nahrání úspěšné")
		else
			toastr.error("Nahrávání některých souborů se nezdařilo")

		if (result.successful.length)
			dispatch("uploadCompleted", result)
	})

	uppy.on("upload-success", (file, response) => {
		dispatch("uploadSuccessful", response)
		// do something with file and response
	})
	uppy.on("upload-error", (file, error, response) => {
		if (response.status === 409) {
			console.error("Same filename already exists", file, error, response)
			toastr.error(`Soubor se názvem '${file.meta.name}' již existuje`)
		}
	})
	uppy.on("dashboard:modal-closed", (file, error, response) => {
		open = false
	})

	export function openModal() {
		open = true
	}

	export function closeModal() {
		open = false
	}
</script>

<DashboardModal
	{uppy}
	{open}
	props={{closeModalOnClickOutside: true}}
/>
