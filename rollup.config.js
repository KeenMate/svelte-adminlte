import svelte from "rollup-plugin-svelte"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import replace from "@rollup/plugin-replace"
import esbuild from "rollup-plugin-esbuild"
import css from "rollup-plugin-css-only"
import {terser} from "rollup-plugin-terser"
import sveltePreprocess from "svelte-preprocess"

const production = process.env.NODE_ENV === "prod"

export default {
	input: "src/main.js",
	output: {
		sourcemap: !production,
		format: "iife",
		name: "app",
		file: "../priv/static/admin-app/bundle.js",
		globals: {
			"jquery": "jQuery",
			"toastr": "toastr"
		}
	},
	external: ["jquery", "toastr"],
	plugins: [
		replace({
			values: {}
		}),
		svelte({
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			},
			preprocess: sveltePreprocess({
				emitCss: true
			})
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({output: "bundle.css"}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ["svelte"]
		}),
		commonjs(),
		esbuild({
			minify: production,
			target: 'es2015'
		}),

		// If we're building for production (npm run build
		// instead of npm run dev, minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
}
