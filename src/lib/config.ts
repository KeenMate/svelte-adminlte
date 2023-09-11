import {lazyLoader} from "@keenmate/js-common-helpers/constatns/defaults"
import {checkPermissions} from "@keenmate/js-common-helpers/helpers/permissions"
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
type DefaultUserType = {
	permissions: string[],
	roles: string[]
}

function emptyUser(): Writable<DefaultUserType | null> {
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
