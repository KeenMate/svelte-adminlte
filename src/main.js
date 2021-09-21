import 'toastr/build/toastr.css';

import App from "./App.svelte"

// import "./assets/overrides.css"
// import "./assets/loader.css"
// import "./assets/select2-overrides.css"
// import "./assets/fonts.css"

const app = new App({
	target: document.getElementById("app")
})

export default app
