export function roundToPrecision(number, precision = 2) {
	const coeficient = Math.pow(10, precision)
	
	return Math.round((number + Number.EPSILON) * coeficient) / coeficient
}
