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
	import darkTheme from "../../stores/dark-theme"

	const dispatch = createEventDispatcher()

	export let catalogId = null
	export let videoId = null

	const uppy = new Uppy({
		restrictions: {
			maxFileSize: "1000000000", // 1GB
			allowedFileTypes: ["video/*"]
		}
	})
		.use(Dashboard, {
			theme: $darkTheme ? "dark" : "light"
		})
		.use(XHRUpload, {
			endpoint: "UploadPath",
			fieldName: "video",
			headers() {
				return {
					Authorization: "Bearer token"
				}
			},
			locale: uppyLocale
		})

	uppy.on("complete", (result) => {
		console.log("Upload complete! Upload result: ", result)

		if (!result.failed.length)
			toastr.success("Nahrání úspěšné")
		else
			toastr.error("Nahrávání se nezdařilo")

		if (result.successful.length)
			dispatch("uploadCompleted")
	})
	uppy.on("upload-error", (file, error, response) => {
		if (response.status === 409) {
			toastr.error(`Soubor se názvem '${file.meta.name}' již existuje`)
			console.error("Same filename already exists", file, error, response)
		}
	})

	export function openModal() {
		uppy.getPlugin("Dashboard").openModal()
	}

	export function closeModal() {
		uppy.getPlugin("Dashboard").closeModal()
	}
</script>

<DashboardModal
	{uppy}
/>

<style>
    /*:global {*/
    /*	@import "../../../node_modules/@uppy/core/dist/style.css";*/
    /*	@import "../../../node_modules/@uppy/dashboard/dist/style.css";*/
    /*}*/
</style>
