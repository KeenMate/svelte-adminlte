import {writable} from "svelte/store"

const {subscribe, update} =
	writable(localStorage.getItem("theme") === "true")

export default {
	subscribe,
	toggle() {
		return update(x => {
			localStorage.setItem("theme", (!x).toString())
			return !x
		})
	}
}
