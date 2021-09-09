import {writable} from "svelte/store"
import {HubConnectionBuilder} from "@microsoft/signalr"
import toastr from "../../helpers/toastr-helpers"

export const socketConnected = writable(false)

const connection = new Promise(resolve => {
	const conn = new HubConnectionBuilder()
		.withUrl(__WEBSOCKET_URL__)
		.withAutomaticReconnect()
		.build()

	conn.start()
		.then(() => {
			resolve(conn)
		})
})

connection.then(conn => {
	conn.onclose(() => {
		toastr.warning("Spojení přerušeno!")
		socketConnected.set(false)
	})
})

connection.then(conn => {
	conn.onreconnected(() => {
		toastr.success("Spojení opětovně navázáno!")
		socketConnected.set(true)
	})
})

connection.then(conn => {
	conn.onreconnecting(error => {
		if (!error)
			return

		console.error("Error occured while reconnecting WS", error)
		toastr.error("Nepodařilo znovu navázat spojení")
	})
})

export default connection
