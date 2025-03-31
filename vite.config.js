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
			restoreMocks: true,
			include: [
				'test/unit/**/*.js',
			],
			browser: {
				enabled: true,
				screenshotFailures: false,
				headless: true,
				provider: 'playwright',
				instances: [
					{ browser: 'webkit' },
					{ browser: 'chromium' },
					{ browser: 'firefox' },
				],
			},
		},
	},
})
