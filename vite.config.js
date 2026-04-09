/**
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { createLibConfig } from '@nextcloud/vite-config'
import { RandomPortGenerator } from 'testcontainers'

// Pick a random port during configuration and use it to configure the JSDOM environment.
// Later in the integration tests, start the Nextcloud server with the same port, so that the origins match.
//
// JSDOM needs to be configured to have the same origin as the Nextcloud server,
// because of how this library and the Nextcloud server interact in browsers (or browser-like environments like JSDOM).
// This seems to be the limitation discussed in https://github.com/nextcloud/server/issues/3131.
//
// For JSDOM the origins needs to be configured here in the Vite config.
// Using `jsdom.reconfigure({ url })` after the container creation does not work,
// because JSDOM does not use the new URL as origin when determining CORS behavior.
// Not sure if this is intentional or a bug in JSDOM, but it is how it works currently.
const randomPort = await new RandomPortGenerator().generatePort()

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
				'test/integration/**/*.js',
			],
			environment: 'jsdom',
			environmentOptions: {
				jsdom: {
					url: `http://localhost:${randomPort}`,
				},
			},
		},
	},
})
