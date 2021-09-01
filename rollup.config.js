import svelte from "rollup-plugin-svelte"
import commonjs from "@rollup/plugin-commonjs"
import resolve from "@rollup/plugin-node-resolve"
import replace from "@rollup/plugin-replace"
import esbuild from "rollup-plugin-esbuild"
import css from "rollup-plugin-css-only";
import livereload from 'rollup-plugin-livereload';
import {terser} from "rollup-plugin-terser"
import copy from "rollup-plugin-copy"
import sveltePreprocess from "svelte-preprocess"

const production = process.env.NODE_ENV === "prod"


function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}


export default {
	input: "src/main.js",
	output: {
		sourcemap: !production,
		format: "iife",
		name: "app",
		file: "public/admin-app/bundle.js",
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

		copy({
			targets: [
				// {src: "src/assets/*", dest: "public"}
			]
		}),

		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		
		commonjs(),

		esbuild({
			minify: production,
			target: 'es2015'
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: true
	}
}
