import {sveltekit} from "@sveltejs/kit/vite"

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	build:{
		target: "node22"
	},
	resolve: {
		alias: {
			"~bootstrap": "bootstrap",
			$lib: "src/lib"
		}
	}
}

export default config
