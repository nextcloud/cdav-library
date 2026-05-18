/**
 * SPDX-FileCopyrightText: 2025 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it, vi } from 'vitest'

import Client from '../../src/index.js'
import * as NS from '../../src/utility/namespaceUtility.js'

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

describe('calendar home helpers', () => {
	it('reuses an existing calendar home instance for a known URL', async () => {
		const client = new Client({ rootUrl: 'https://cloud.example.com/remote.php/dav/' })
		await client._extractCalendarHomes({
			[`{${NS.IETF_CALDAV}}calendar-home-set`]: ['/remote.php/dav/calendars/users/alice/'],
		})

		const calendarHome = client.getCalendarHomeForUrl('https://cloud.example.com/remote.php/dav/calendars/users/alice')

		expect(calendarHome).toBe(client.calendarHomes[0])
	})

	it('creates a new calendar home instance for an unknown URL', async () => {
		const client = new Client({ rootUrl: 'https://cloud.example.com/remote.php/dav/' })
		await client._extractCalendarHomes({
			[`{${NS.IETF_CALDAV}}calendar-home-set`]: ['/remote.php/dav/calendars/users/alice/'],
		})

		const calendarHome = client.getCalendarHomeForUrl('https://cloud.example.com/remote.php/dav/calendars/users/bob/')

		expect(calendarHome).not.toBe(client.calendarHomes[0])
		expect(calendarHome.url).toBe('/remote.php/dav/calendars/users/bob/')
	})

	it('returns the cached home URL for the current principal without a request', async () => {
		const client = new Client({ rootUrl: 'https://cloud.example.com/remote.php/dav/' })
		await client._extractCalendarHomes({
			[`{${NS.IETF_CALDAV}}calendar-home-set`]: ['/remote.php/dav/calendars/users/alice/'],
		})
		client.currentUserPrincipal = { url: '/remote.php/dav/principals/users/alice/' }
		const propFindSpy = vi.spyOn(client._request, 'propFind')

		const calendarHomeUrl = await client.getCalendarHomeUrlForPrincipal('https://cloud.example.com/remote.php/dav/principals/users/alice/')

		expect(calendarHomeUrl).toBe('https://cloud.example.com/remote.php/dav/calendars/users/alice/')
		expect(propFindSpy).not.toHaveBeenCalled()
	})

	it('falls back to PROPFIND for a different principal', async () => {
		const client = new Client({ rootUrl: 'https://cloud.example.com/remote.php/dav/' })
		client.currentUserPrincipal = { url: '/remote.php/dav/principals/users/alice/' }
		const propFindSpy = vi.spyOn(client._request, 'propFind').mockResolvedValue({
			body: {
				[`{${NS.IETF_CALDAV}}calendar-home-set`]: ['/remote.php/dav/calendars/users/bob/'],
			},
		})

		const calendarHomeUrl = await client.getCalendarHomeUrlForPrincipal('https://cloud.example.com/remote.php/dav/principals/users/bob/')

		expect(propFindSpy).toHaveBeenCalledOnce()
		expect(calendarHomeUrl).toBe('https://cloud.example.com/remote.php/dav/calendars/users/bob/')
	})

	it('returns null when calendar-home-set is missing', async () => {
		const client = new Client({ rootUrl: 'https://cloud.example.com/remote.php/dav/' })
		client.currentUserPrincipal = { url: '/remote.php/dav/principals/users/alice/' }
		vi.spyOn(client._request, 'propFind').mockResolvedValue({ body: {} })

		await expect(client.getCalendarHomeUrlForPrincipal('https://cloud.example.com/remote.php/dav/principals/users/bob/')).resolves.toBeNull()
	})
})
