import {CommSensitivityConfidential, CommSensitivityPublic} from "../constants/translations"

export function getOutCommChannelStateIcon(state) {
	switch (state) {
		case "draft":
			return "fa-briefcase"
		case "submitted":
			return "fa-envelope"
		case "processing":
			return "fa-cogs"
		case "waiting_approval":
			return "fa-stopwatch"
		case "approved":
			return "fa-check"
		case "published":
			return "fa-newspaper"
		case "canceled":
			return "fa-times-circle"
		default:
			return "fa-comment-dots"
	}
}

export function getOutCommChannelStateToString(state) {
	switch (state) {
		case "draft":
			return "Draft"
		case "submitted":
			return "Odesláno ke schválení"
		case "processing":
			return "Zpracovává se"
		case "waiting_approval":
			return "Čeká na schválení"
		case "approved":
			return "Schváleno"
		case "published":
			return "Publikováno"
		case "canceled":
			return "Zrušeno"
		default:
			return ""
	}
}

export function getOutCommChannelStateLabelColor(state) {
	switch (state) {
		case "draft":
			return "default"
		case "submitted":
			return "info"
		case "processing":
			return "info"
		case "waiting_approval":
			return "info"
		case "approved":
			return "primary"
		case "published":
			return "success"
		case "canceled":
			return "danger"
		default:
			return "default"
	}
}

export function getOutCommSensitivityIcon(state) {
	switch (state) {
		case "public":
			return "fa-users"
		case "confidential":
			return "fa-user-secret"
		default:
			return "default"
	}
}

export function getOutCommSensitivityLabelColor(sensitivity) {
	switch (sensitivity) {
		case "public":
			return "primary"
		case "confidential":
			return "warning"
		default:
			return "default"
	}
}

export function getOutCommChannelSensitivityToString(sensitivity) {
	switch (sensitivity) {
		case "public":
			return CommSensitivityPublic
		case "confidential":
			return CommSensitivityConfidential
		default:
			return "-"
	}
}
