module.exports = {
	root: true,
	extends: ['eslint:recommended', 'prettier'],
	plugins: ['svelte3'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	parserOptions: {
		sourceType: 'module',
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
		indent: ["error", "tab", {SwitchCase: 1}],
	}
};
