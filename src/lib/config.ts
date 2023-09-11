import {lazyLoader} from "@keenmate/js-common-helpers/constatns/defaults"
import {checkPermissions} from "@keenmate/js-common-helpers/helpers/permissions"
import {writable, type Writable} from "svelte/store"

const currentConfig = {
	ToastrOptions: {
		closeButton: false,
		debug: false,
		newestOnTop: false,
		progressBar: false,
		positionClass: "toast-bottom-right",
		preventDuplicates: false,
		onclick: undefined,
		showDuration: 300,
		hideDuration: 1000,
		timeOut: 3000,
		extendedTimeOut: 1000,
		showEasing: "swing",
		hideEasing: "linear",
		showMethod: "fadeIn",
		hideMethod: "fadeOut"
	},
	DateFormat: "D",
	DateTimeFormat: "f",
	TimeFormat: "t",
	ReverseDateFormat: "yyyy-LL-dd",
	ReverseDateTimeFormat: "yyyy-LL-dd_HH-mm-ss",
	TypingDebounceDelay: 300,
	lazyLoader: lazyLoader,
	permissions: {
		defaultComparison: "any",
		permissionCheck: checkPermissions
	},
	currentUser: emptyUser()
}
type DefaultUserType = {
	permissions: string[],
	roles: string[]
}

function emptyUser(): Writable<DefaultUserType | null> {
	return writable(null)
}

export type config = typeof currentConfig

export function setConfig(partialConfig: Partial<config>) {
	Object.assign(currentConfig, partialConfig)
}

export function getConfig() {
	return currentConfig
}
