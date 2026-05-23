/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from 'vitest'

import { DeletedCalendarObject } from '../../../src/models/deletedCalendarObject.js'
import { VObject } from '../../../src/models/vobject.js'
import RequestMock from '../../mocks/request.mock.js'
import { DavCollection as DavCollectionMock } from '../../mocks/davCollection.mock.js'

describe('DeletedCalendarObject model', () => {

	it('should inherit from VObject', () => {
		const parent = new DavCollectionMock()
		const request = new RequestMock()
		const url = '/trash-bin/objects/deleted.ics'
		const props = {
			'{DAV:}getetag': '"etag"',
			'{DAV:}getcontenttype': 'text/calendar',
			'{DAV:}resourcetype': [],
			'{urn:ietf:params:xml:ns:caldav}calendar-data': 'BEGIN:VCALENDAR\nEND:VCALENDAR',
		}

		const object = new DeletedCalendarObject(parent, request, url, props)
		expect(object).toEqual(expect.any(VObject))
	})

	it('should expose deleted calendar object properties', () => {
		const parent = new DavCollectionMock()
		const request = new RequestMock()
		const url = '/trash-bin/objects/deleted.ics'
		const props = {
			'{DAV:}getetag': '"etag"',
			'{DAV:}getcontenttype': 'text/calendar',
			'{DAV:}resourcetype': [],
			'{urn:ietf:params:xml:ns:caldav}calendar-data': 'BEGIN:VCALENDAR\nEND:VCALENDAR',
			'{http://nextcloud.com/ns}calendar-uri': 'calendar-1',
			'{http://nextcloud.com/ns}source-calendar-uri': 'source',
			'{http://nextcloud.com/ns}calendar-owner-principal-uri': 'principals/users/user',
			'{http://nextcloud.com/ns}deleted-at': new Date('2026-05-20T10:11:12Z'),
		}

		const object = new DeletedCalendarObject(parent, request, url, props)

		expect(object.calendarUri).toEqual('calendar-1')
		expect(object.sourceCalendarUri).toEqual('source')
		expect(object.calendarOwnerPrincipalUri).toEqual('principals/users/user')
		expect(object.deletedAt).toEqual(new Date('2026-05-20T10:11:12Z'))
	})

})
