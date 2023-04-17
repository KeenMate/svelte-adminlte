import CBuffer from "CBuffer"
import {type Writable, writable} from "svelte/store"
import {DateTime} from "luxon"

import Toastr from "./toastr"

const MessageCount = 500

export const NotificationType = {
	Warning: "Warning",
	Success: "Success",
	Error: "Error"
}

type message = {
	type: string
	messsage: string
	title: string | undefined
	timestamp: DateTime
}

class NotificationProvider {
	buffer: CBuffer<message>
	messages: Writable<any[]>

	constructor() {
		this.buffer = new CBuffer<message>(MessageCount)
		this.messages = writable([])
	}

	#saveMessage(type: string, message: string, title: string) {
		// @ts-ignore
		//buffer has wrong
		this.buffer.push({type, message, title, timestamp: DateTime.now()})
		this.messages.set(this.buffer.toArray())
	}

	warning(message: string, title = "", options = {}) {
		this.#saveMessage(NotificationType.Warning, message, title)
		Toastr.warning(message, title, options)
	}

	success(message: string, title = "", options = {}) {
		this.#saveMessage(NotificationType.Success, message, title)
		Toastr.success(message, title, options)
	}

	error(message: string, title = "", options = {}) {
		this.#saveMessage(NotificationType.Error, message, title)
		Toastr.error(message, title, options)
	}
}

export default new NotificationProvider()
