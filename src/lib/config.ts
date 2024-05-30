import {lazyLoader} from "@keenmate/js-common-helpers/constants/defaults.js"
import {checkPermissions} from "@keenmate/js-common-helpers/helpers/permissions.js"
import type {Requirements, IPermissionsUser} from "@keenmate/js-common-helpers/helpers/permissions.js"
import {writable} from "svelte/store"

export const Config = writable({
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
		checkPermissions(user?: IPermissionsUser, requiredPermissions?: Requirements) {
			return checkPermissions(user?.permissions, requiredPermissions)
		},
		checkRoles(user?: IPermissionsUser, requiredPermissions?: Requirements) {
			return checkPermissions(user?.roles, requiredPermissions)
		}
		// permissionCheck: checkPermissions
	},
	currentUser: null,

	defaults: {
		// todo: add function that will compute options for (specialized) buttons
		
		/**
		 * `options` are meant to be base for all buttons while specialized config (e.g. `refreshButton` will override/enhance config of the `options`).
		 * All these options are supposed to be passed into the `LteButton` as-is
		 */
		buttons: {
			options: {
				size: null,
				borderless: false,
				outlined: false,
				social: false,
				link: false,
				disabled: false,
				app: false,
				squared: false,
			},

			refreshButton: {
				color: "info",
				iconClass: "fas fa-sync"
			},
			saveButton: {
				color: "success",
				iconClass: "fas fa-save"
			},
			deleteButton: {
				color: "danger",
				iconClass: "fas fa-trash"
			}
		},
	},
})

export type config = typeof Config
