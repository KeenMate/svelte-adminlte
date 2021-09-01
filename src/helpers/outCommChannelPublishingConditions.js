import {currentUserIsAdminStore} from "../stores/current-user"
import {get} from "svelte/store"

export function canBeApproved(outCommChannel) {
	const isAdmin = get(currentUserIsAdminStore)
	return isAdmin && ["draft", "waiting_approval"].includes(outCommChannel.state)
}

export function canBeRejected(outCommChannel) {
	const isAdmin = get(currentUserIsAdminStore)
	return isAdmin && ["waiting_approval", "approved"].includes(outCommChannel.state)
}

export function canBePublished(outCommChannel) {
	// return outCommChannel.state === "approved"

	const isAdmin = get(currentUserIsAdminStore)
	return isAdmin && ["draft", "approved"].includes(outCommChannel.state)
}

export function canBeRemoved(outCommChannel) {
	return !["published", "canceled"].includes(outCommChannel.state)
}

export function canBeSwitchedToDraft(outCommChannel) {
	return !["published", "draft"].includes(outCommChannel.state)
}
