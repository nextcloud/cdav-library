/**
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import cdav = require('@nextcloud/cdav-library')

const client = new cdav.default({ rootUrl: 'https://example.com/remote.php/dav/' })
const connected: Promise<cdav.default> = client.connect({ enableCardDAV: true })
cdav.debug.enabled = false
cdav.debug('types')(cdav.namespaces.DAV, connected)
// @ts-expect-error The CommonJS module exposes the constructor as .default.
new cdav({ rootUrl: '/' })
// @ts-expect-error Root URL must be a string.
new cdav.default({ rootUrl: 123 })
