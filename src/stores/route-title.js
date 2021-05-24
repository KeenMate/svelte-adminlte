import {writable} from "svelte/store"

const routeTitle = writable(null)

export function setCatalogVideosTitle(catalog) {
	if (!catalog || !catalog.title)
		return

	routeTitle.set(`Videa katalogu '${catalog.title}'`)
}

export function setVideoEditTitle(video) {
	routeTitle.set(`Editace videa${video ? (" '" + (video.title || video.filename) + "'") : ""}`)
}

export function clearRouteTitle() {
	routeTitle.set(null)
}

export default routeTitle
