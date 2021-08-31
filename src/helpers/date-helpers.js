import moment from "moment"
import {DisplayDateFormat, DisplayDateTimeFormat, IsoDateFormat} from "../constants/date"

export function formatDateTime(datetime) {
	if (!datetime)
		return ""

	return moment(datetime).format(DisplayDateTimeFormat)
}

export function formatDate(date) {
	if (!date)
		return ""

	return moment(date).format(DisplayDateFormat)
}

export function formatIsoDate(date) {
	if (!date)
		return null

	return moment(date).format(IsoDateFormat)
}

export function parseIsoDate(dateString) {
	if (!dateString)
		return null

	return moment(dateString, IsoDateFormat).toDate()
}
