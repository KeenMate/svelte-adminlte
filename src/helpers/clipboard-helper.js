export function copyToClipboard(text) {

	console.log("Copying", text)
	return navigator.clipboard.writeText(text)
}

export function readFromClipboard() {
	return navigator.clipboard.readText()
}
