export function getValidityClass(validity:string) {
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
export function getBackgroundColorClass(backgroundColor: string) {
	switch (backgroundColor) {
		case "none":
			return "";
		case "danger":
			return "bg-danger";
		case "warning":
			return "bg-warning";
		case "success":
			return "bg-success";
		default:
			return "";
	}
}
