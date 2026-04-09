/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { GenericContainer, Wait } from 'testcontainers'
import Client from '../../src/index.js'

/**
 * Sets up authentication cookies for the Nextcloud instance,
 * so that further requests do not need to include the Authorization header.
 * @param {string} nextcloudBaseUrl - The base URL of the Nextcloud instance, e.g. http://localhost:8080
 */
async function setAuthCookies(nextcloudBaseUrl) {
	const xhr = await new Promise((resolve, reject) => {
		const xhr = new window.XMLHttpRequest()
		xhr.open('GET', `${nextcloudBaseUrl}/login`, true)
		xhr.setRequestHeader('Authorization', `Basic ${btoa('admin:admin')}`)
		xhr.onload = () => resolve(xhr)
		xhr.onerror = () => reject(new Error(`XHR login failed with status ${xhr.status}`))
		xhr.onabort = () => reject(new Error('XHR login aborted'))
		xhr.send()
	})

	if (xhr.status !== 200) {
		throw new Error(`Login failed ${xhr.status} ${xhr.statusText}`)
	}
}

describe('Client', () => {
	let container
	/**
	 * @type {Client}
	 */
	let client

	beforeAll(async () => {
		// Possible DX improvement:
		//   - write logs not to /var/www/nextcloud/data/nextcloud.log but to stdout/stderr
		//     - them only if test fails write them to stdout/stderr
		//       - clear logs before each test
		//  - use `test.for` or matrix tests to test with different versions of Nextcloud
		//  - extract container setup for other tests
		//    - maybe as reusable fixture
		//      - see https://vitest.dev/guide/test-context.html#extend-test-context
		const CONTAINER_PORT = 80
		container = await new GenericContainer('nextcloud:latest')
			.withExposedPorts({
				container: CONTAINER_PORT,
				host: window.location.port,
			})
			.withEnvironment({
				NEXTCLOUD_ADMIN_USER: 'admin',
				NEXTCLOUD_ADMIN_PASSWORD: 'admin',
				SQLITE_DATABASE: 'nextcloud.sqlite',
			})
			.withWaitStrategy(Wait.forHttp('/status.php', CONTAINER_PORT)
				.withHeaders({ Host: 'localhost' }),
			)
			.start()

		const baseUrl = `${window.location.origin}`
		await setAuthCookies(baseUrl)

		const davUrl = `${baseUrl}/remote.php/dav`
		client = new Client({ rootUrl: davUrl })
	},
	// Increase the timeout to not fail when pulling the image.
	// Especially relevant for CI.
	60_000)

	afterAll(async () => {
		client = undefined
		await container?.stop()
		container = undefined
	})

	it('should connect', async () => {
		await client.connect({ enableCalDAV: true })

		const principal = client.currentUserPrincipal
		expect(principal.userId).toBe('admin')
	})
})
