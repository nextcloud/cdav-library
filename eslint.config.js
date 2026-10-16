/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { recommendedJavascript } from '@nextcloud/eslint-config'

export default [
	...recommendedJavascript,
	{
		rules: {
			// TypeScript reads @overload from JSDoc to type the generated declarations
			'jsdoc/check-tag-names': ['error', { definedTags: ['overload'] }],
		},
	},
]
