import toastr from "toastr"
import {Config} from "$lib/config.js"

Config.subscribe(config => {
    console.log("Using toastr options from config")
    toastr.options = config.ToastrOptions
})

export default toastr
