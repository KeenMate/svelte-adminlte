import adapter from "@sveltejs/adapter-static"
import sveltePreprocess from "svelte-preprocess"

/** @type {import("@sveltejs/kit").Config} */
const config = {
	kit: {
		adapter: adapter({fallback: "index.html"})
	},
	preprocess: sveltePreprocess()
}

export default config
