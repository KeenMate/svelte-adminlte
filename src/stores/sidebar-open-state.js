import {get, writable} from "svelte/store"

const localStorageKey = "sidebar_opened"

const sidebarOpenState = writable(localStorage.getItem(localStorageKey) === "true")

export function toggleSidebarOpened() {
	sidebarOpenState.update(currentState => {
		const newState = !currentState
		localStorage.setItem(localStorageKey, newState.toString())
		return newState
	})
}

export default sidebarOpenState
