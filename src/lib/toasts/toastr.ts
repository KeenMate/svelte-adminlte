import toastr from "toastr"
import {Config} from "$lib/config.js"

Config.subscribe(config => {
	toastr.options = config.ToastrOptions
})

export default toastr
