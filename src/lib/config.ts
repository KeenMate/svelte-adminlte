import {lazyLoader} from "@keenmate/js-common-helpers/src/constatns/defaults"
import {checkPermissions} from "@keenmate/js-common-helpers/src/helpers/permissions"
import {writable, type Writable} from "svelte/store"

const defaultConfig = {
	ToastTimeOut: 3000,
	ToastExtendedTimeOut: 1000,
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
type defaultUserType = {
	permissions: string[]
}

function emptyUser(): Writable<null | defaultUserType> {
	return writable(null)
}

export type config = typeof defaultConfig

let currentConfig = defaultConfig

export function setConfig(config: object) {
	currentConfig = {...currentConfig, ...config}
}

export function getConfig() {
	return currentConfig
}
