module.exports = {
	root: true,
	env: {
		browser: true,
		es6: true,
		node: true
	},
	globals: {
		dav: true
	},
	extends: ['eslint:recommended', 'plugin:node/recommended', 'standard'],
	plugins: ['node'],
	rules: {
		// space before function ()
		'space-before-function-paren': ['error', 'never'],
		// curly braces always space
		'object-curly-spacing': ['error', 'always'],
		'array-bracket-spacing': ['error', 'never'],
		// stay consistent with array brackets
		'array-bracket-newline': ['error', 'consistent'],
		// 1tbs brace style
		'brace-style': 'error',
		// tabs only
		indent: ['error', 'tab'],
		'no-tabs': 0,
		// only debug console
		'no-console': ['error', { allow: ['error', 'warn', 'debug'] }],
		// classes blocks
		'padded-blocks': ['error', { classes: 'always' }],
		// always have the operator in front
		'operator-linebreak': ['error', 'before'],
		// ternary on multiline
		'multiline-ternary': ['error', 'always-multiline'],
		// es6 import/export and require
		'node/no-unsupported-features/es-syntax': ['off'],
		// disable the recommended no-extra-semi
		semi: ['error', 'always'],
	}
};
