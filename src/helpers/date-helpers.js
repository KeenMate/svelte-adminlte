import moment from "moment"

export function formatDateTime(datetime) {
	if (!datetime)
		return ""

	return moment(datetime).format("DD.MM.YYYY hh:mm:ss")
}
