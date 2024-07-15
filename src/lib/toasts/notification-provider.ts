import CBuffer from "CBuffer"
import { get, type Writable, writable } from "svelte/store"
import { DateTime } from "luxon"

import Toastr from "./toastr.js"
import { Config } from "$lib/config.js"

const MessageCount = 500

export const NotificationType = {
	Warning: "Warning",
	Success: "Success",
	Error: "Error"
}

type message = {
	type: string
	message: string
	title: string | undefined
	timestamp: DateTime
}

class NotificationProvider {
	buffer: CBuffer<message>
	messages: Writable<message[]>

	constructor() {
		this.buffer = new CBuffer<message>(MessageCount)
		this.messages = writable([])
	}

	#saveMessage(type: string, message: string, title: string) {
		this.buffer.push({ type, message, title, timestamp: DateTime.now() })
		this.messages.set(this.buffer.toArray())
	}

	warning(message: string, title = "", options: ToastrOptions = {}) {
		this.#saveMessage(NotificationType.Warning, message, title)

		if (!options.timeOut) {
			options.timeOut = get(Config).ToastrOptions.warningTimeout
		}
		Toastr.warning(message, title, { ...options, timeOut: options.timeOut })
	}

	success(message: string, title = "", options: ToastrOptions = {}) {
		this.#saveMessage(NotificationType.Success, message, title)
		Toastr.success(message, title, options)
	}

	error(message: string, title = "", options: ToastrOptions = {}) {
		this.#saveMessage(NotificationType.Error, message, title)

		if (!options.timeOut) {
			options.timeOut = get(Config).ToastrOptions.errorTimeout
		}


		Toastr.error(message, title, { ...options, timeOut: options.timeOut })
	}
}

export default new NotificationProvider()
