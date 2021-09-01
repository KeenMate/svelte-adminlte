export function getRandomString(length) {
	let randomNumbers = []

	for (let i = 0; i < length; i++)
		randomNumbers.push(getRandomCharCode())

	return String.fromCharCode(...randomNumbers)
}

export function capitalize([first, ...rest]) {
	return first.toLocaleUpperCase() + rest.join("")
}

export function removeDiacritics(str) {
	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

function getRandomCharCode() {
	return 65 + Math.round(Math.random() * 25)
}
