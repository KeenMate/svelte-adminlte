import {roundToPrecision} from "./number-helpers"

export const Units = [
	"kB",
	"MB",
	"GB"
]

export function fileSizeToString(fileSize) {
	let divider = 1_000
	let unitCount = 0

	while (fileSize / divider >= 1000) {
		divider *= 1000
		unitCount++
	}

	return {
		unit: Units[unitCount],
		value: roundToPrecision(fileSize / divider)
	}
}

export function toMegabytes(fileSize) {
	if (!fileSize || isNaN(fileSize))
		return ""

	return roundToPrecision((fileSize / 1_000_000))
}
