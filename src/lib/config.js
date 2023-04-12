import {lazyLoader} from "js-common-helpers/src/constatns/defaults"

const defaultConfig = {
	ToastTimeOut: 3000,
	ToastExtendedTimeOut: 1000,
	DateFormat: "D",
	DateTimeFormat: "f",
	TimeFormat: "t",
	ReverseDateFormat: "yyyy-LL-dd",
	ReverseDateTimeFormat: "yyyy-LL-dd_HH-mm-ss",
	TypingDebounceDelay: 300,
	lazyLoader: lazyLoader
}

let currentConfig = defaultConfig

/**
 * @param {object} config
 */
export function setConfig(config) {
	currentConfig = {...currentConfig, ...config}
}

export function getConfig() {
	return currentConfig
}
