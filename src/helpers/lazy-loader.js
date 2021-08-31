import {leaveLoaderFor, waitForLoader} from "../constants/ui"
import {emptyPromise} from "./promise-helpers"

export default function lazyLoader(resourceTask, showLoader, hideLoader) {
	if (!(resourceTask instanceof Promise))
		return emptyPromise

	let loaderShowed = false
	const beforeShowTimer = setTimeout(() => {
		// console.trace("Timeout for showing loader", new Date().getMilliseconds())
		loaderShowed = new Date()
		// console.trace("Showing loader", new Date().getMilliseconds())
		showLoader()
	}, waitForLoader)

	return resourceTask
		.then(res => {
			if (!loaderShowed) {
				// console.trace("Loader not yet showed, clearing timer", new Date().getMilliseconds())
				clearTimeout(beforeShowTimer)
				// console.trace("Hiding loader", new Date().getMilliseconds())
				hideLoader()
				return res
			}

			// hideLoader()
			// return res


			if (new Date() - loaderShowed > leaveLoaderFor) {
				// console.trace("Hiding loader because it has been shown long enough", new Date().getMilliseconds())
				hideLoader()
				return res
			}

			// this leaves the loader showed for additional time
			return new Promise(resolve => {
				setTimeout(() => {
					// console.trace("Resolving lazy load value", new Date().getMilliseconds())
					resolve(res)
					// console.trace("Hiding loader because additional delay passed away", new Date().getMilliseconds())
					hideLoader()
				}, leaveLoaderFor - (new Date() - loaderShowed))
			})
		})
}
