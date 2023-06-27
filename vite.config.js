import {sveltekit} from "@sveltejs/kit/vite"

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	resolve: {
		alias: {
			"~bootstrap": "bootstrap",
			"$lib": "src/lib"
		}
	}
}

export default config
