import toastr from "toastr"
import {getConfig} from "../config.js"

let config = getConfig()

toastr.options = config.ToastrOptions

export default toastr
