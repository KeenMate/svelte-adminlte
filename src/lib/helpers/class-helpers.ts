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
export enum Validity {
	None = "none",
	Invalid = "invalid",
	Warning = "warning",
	Valid = "valid"
}