/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createLibConfig } from '@nextcloud/vite-config'

export default createLibConfig({
	index: 'src/index.js',
}, {
	libraryFormats: ['es', 'cjs'],
	config: {
		test: {
			setupFiles: ['test/setup.js'],
			coverage: {
				include: ['src'],
				provider: 'istanbul',
				reporter: ['json'],
				reportOnFailure: true,
			},
			restoreMocks: true,
			include: [
				'test/unit/**/*.js',
			],
			environment: 'jsdom',
		},
	},
})
