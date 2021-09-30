import Route1 from "./routes/Route1.svelte"
import Users from "./routes/Users.svelte"
import Tree from "./routes/Tree.svelte"
import List from "./routes/List.svelte"
import NotFound from "./routes/NotFound.svelte"
import Error from "./routes/Error.svelte"

export const Routes = [
	{
		name: "Route1",
		title: "The route no. 1",
		route: "/",
		breadcrumb: ["Route 1"]
	},
	{
		name: "Error",
		title: "Error",
		route: "/error",
		breadcrumb: ["Error"]
	},
	{
		name: "Users",
		title: "Users",
		route: "/users",
		breadcrumb: ["Users"]
	},
	{
		name: "Tree",
		title: "Tree",
		route: "/tree",
		breadcrumb: ["Tree"]
	},
	{
		name: "List",
		title: "List",
		route: "/list",
		breadcrumb: ["List"]
	},
]

export const Urls = Routes
	.reduce((acc, x) => {
		acc[x.name] = x.route
		return acc
	}, {})

export function fillParams(route, params) {
	return Object
		.keys(params)
		.reduce(
			(acc, key) => acc.replace(`:${key}`, params[key]),
			route
		)
}

export function routeToRegex(route) {
	return "^" + route.replace(/\/:\w+(\??)/, "/?([\\w\-\d]+)$1") + "$"
}

export default {
	[Urls.Route1]: Route1,
	[Urls.Users]: Users,
	[Urls.Tree]: Tree,
	[Urls.List]: List,
	[Urls.Error]: Error,
	// The catch-all route must always be last
	"*": NotFound
}
