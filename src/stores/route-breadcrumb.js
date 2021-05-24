import {writable} from "svelte/store"

const routeBreadcrumbs = writable(null)

export function setRouteBreadcrumbs(breadcrumbs) {
	routeBreadcrumbs.set(breadcrumbs)
}

export function clearRouteBreadcrumbs() {
	routeBreadcrumbs.set(null)
}

export default routeBreadcrumbs
