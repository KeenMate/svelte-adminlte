export function getValidityClass(validity) {
	switch (validity) {
		case "none":
			return "";
		case "invalid":
			return "is-invalid";
		case "warning":
			return "is-warning";
		case "valid":
			return "is-valid";
		default:
			return "";
	}
}

