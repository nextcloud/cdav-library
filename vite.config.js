/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { copyFile } from 'node:fs/promises'
import { createLibConfig } from '@nextcloud/vite-config'

export default createLibConfig({
	index: 'src/index.js',
}, {
	libraryFormats: ['es', 'cjs'],
	DTSPluginOptions: {
		tsconfigPath: './tsconfig.json',
		rollupTypes: true,
		afterDiagnostic(diagnostics) {
			if (diagnostics.length > 0) {
				throw new Error('Type declaration generation failed')
			}
		},
		async afterBuild() {
			// Both entry points expose the same exports, but require distinct module types.
			await copyFile('dist/index.d.ts', 'dist/index.d.cts')
		},
	},
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
