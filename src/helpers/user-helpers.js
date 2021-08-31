export function isAdmin(user) {
	return user?.userRole === "admin"
}

export function userRoleToString(user) {
	if (!user)
		return null

	switch (user.userRole) {
		case "admin":
			return "Admin"
		case "observer":
			return "Manažer"
		case "requester":
			return "Zadavatel"
		default:
			console.log("Unknown user role: ", userRole)
			return null
	}
}
