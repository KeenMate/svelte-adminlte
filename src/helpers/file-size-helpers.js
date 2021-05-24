import {roundToPrecision} from "./number-helpers"

export function toMegabytes(fileSize) {
	return roundToPrecision((fileSize / 1_000_000))
}
