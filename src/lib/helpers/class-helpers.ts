export function getValidityClass(validity: string) {
	switch (validity) {
		case "none":
			return ""
		case "invalid":
			return "is-invalid"
		case "warning":
			return "is-warning"
		case "valid":
			return "is-valid"
		default:
			return ""
	}
}

export function getAccentClass(accent: string) {
	switch (accent) {
		case "none":
			return ""
		case "info":
			return "bg-info"
		case "danger":
			return "bg-danger"
		case "warning":
			return "bg-warning"
		case "success":
			return "bg-success"
		default:
			return ""
	}
}
