import toastr from "toastr"
import {getConfig} from "../config.js"

let config = getConfig()

toastr.options = {
	closeButton: false,
	debug: false,
	newestOnTop: false,
	progressBar: false,
	positionClass: "toast-bottom-right",
	preventDuplicates: false,
	onclick: undefined,
	showDuration: 300,
	hideDuration: 1000,
	timeOut: config.ToastTimeOut,
	extendedTimeOut: config.ToastExtendedTimeOut,
	showEasing: "swing",
	hideEasing: "linear",
	showMethod: "fadeIn",
	hideMethod: "fadeOut"
}

export default toastr
