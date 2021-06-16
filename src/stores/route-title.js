import {writable} from "svelte/store"

const routeTitle = writable(null)

export function setDistChannelsTitle(distChannel) {
	if (!distChannel || !distChannel.title)
		return

	routeTitle.set(`Editace distribučního kanálu '${distChannel.title}'`)
}

export function setCommChannelsTitle(commChannel) {
	if (!commChannel || !commChannel.title)
		return

	routeTitle.set(`Editace komunikačního kanálu '${commChannel.title}'`)
}

export function setVideoEditTitle(video) {
	routeTitle.set(`Editace videa${(video && (video.title || video.filename)) ? (" '" + (video.title || video.filename) + "'") : ""}`)
}

export function clearRouteTitle() {
	routeTitle.set(null)
}

export default routeTitle
