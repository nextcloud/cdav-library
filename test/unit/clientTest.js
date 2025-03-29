/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it, vi } from 'vitest'

import Client from '../../src/index.js'

describe('Client', () => {
	it('should extract advertised DAV features', () => {
		const headers = {
			dav: '1, 3, extended-mkcol, access-control, calendarserver-principal-property-search, oc-resource-sharing, calendar-access, calendar-proxy, calendar-auto-schedule, calendar-availability, nc-calendar-trashbin, nc-calendar-webcal-cache, calendarserver-subscribed, oc-calendar-publishing, calendarserver-sharing, addressbook, nc-paginate, nextcloud-checksum-update, nc-calendar-search, nc-enable-birthday-calendar',
			foobar: 'baz',
		}

		const client = new Client({
			rootUrl: '/foobar/',
		})
		client._extractAdvertisedDavFeatures(headers)
		expect(client.advertisedFeatures).toEqual([
			'1',
			'3',
			'extended-mkcol',
			'access-control',
			'calendarserver-principal-property-search',
			'oc-resource-sharing',
			'calendar-access',
			'calendar-proxy',
			'calendar-auto-schedule',
			'calendar-availability',
			'nc-calendar-trashbin',
			'nc-calendar-webcal-cache',
			'calendarserver-subscribed',
			'oc-calendar-publishing',
			'calendarserver-sharing',
			'addressbook',
			'nc-paginate',
			'nextcloud-checksum-update',
			'nc-calendar-search',
			'nc-enable-birthday-calendar',
		])
	})
})
