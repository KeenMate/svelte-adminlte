module.exports = {
	root: true,
	extends: [
		"eslint:recommended",
		// "prettier",
		"plugin:svelte/recommended",
		"plugin:@typescript-eslint/recommended"
	],
	plugins: [
		// "svelte3"
		"@typescript-eslint/eslint-plugin"
	],
	overrides: [
		{
			files: ["*.svelte"],
			parser: "svelte-eslint-parser",
			parserOptions: {
				parser: "@typescript-eslint/parser"
			}
		}
	],
	parserOptions: {
		sourceType: "module",
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		"object-curly-spacing": ["error", "never"],
		"array-bracket-spacing": ["error", "never"],
		"computed-property-spacing": ["error", "never"],
		
		// because function declarations would have unused params as well
		"no-unused-vars": "off",
		"@typescript-eslint/no-unused-vars": ["error"],
		"@typescript-eslint/no-explicit-any": "off",
		
		indent: ["error", "tab", {SwitchCase: 1}]
	}
}
