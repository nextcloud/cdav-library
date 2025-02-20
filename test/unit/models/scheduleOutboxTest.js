/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { assert, describe, expect, it, vi } from "vitest";

import ScheduleOutbox from "../../../src/models/scheduleOutbox.js";
import { DavCollection } from "../../../src/models/davCollection.js";

describe('Schedule outbox model', () => {

	it('should inherit from DavCollection', () => {
		const parent = {
            'findAll': vi.fn(),
            'findAllByFilter': vi.fn(),
            'find': vi.fn(),
            'createCollection': vi.fn(),
            'createObject': vi.fn(),
            'update': vi.fn(),
            'delete': vi.fn(),
            'isReadable': vi.fn(),
            'isWriteable': vi.fn()
        };
		const request = {
            'propFind': vi.fn(),
            'put': vi.fn(),
            'delete': vi.fn()
        };
		const url = '/foo/bar/folder';
		const props = {}

		const scheduleOutbox = new ScheduleOutbox(parent, request, url, props)
		expect(scheduleOutbox).toEqual(expect.any(DavCollection))
	});

	it('should provide a method to gather free/busy data', () => {
		const parent = {
            'findAll': vi.fn(),
            'findAllByFilter': vi.fn(),
            'find': vi.fn(),
            'createCollection': vi.fn(),
            'createObject': vi.fn(),
            'update': vi.fn(),
            'delete': vi.fn(),
            'isReadable': vi.fn(),
            'isWriteable': vi.fn()
        };
		const request = {
            'propFind': vi.fn(),
            'put': vi.fn(),
            'delete': vi.fn(),
            'post': vi.fn()
        };
		const url = '/foo/bar/folder';
		const props = {}

		const scheduleOutbox = new ScheduleOutbox(parent, request, url, props)

		const requestData = `BEGIN:VCALENDAR
...
END:VCALENDAR`;

		// Example response taken from https://tools.ietf.org/html/rfc6638#appendix-B.5
		const response = `<?xml version="1.0" encoding="utf-8" ?>
<C:schedule-response xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
<C:response>
<C:recipient>
<D:href>mailto:wilfredo@example.com</D:href>
</C:recipient>
<C:request-status>2.0;Success</C:request-status>
<C:calendar-data>BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp.//CalDAV Server//EN
METHOD:REPLY
BEGIN:VFREEBUSY
UID:4FD3AD926350
DTSTAMP:20090602T200733Z
DTSTART:20090602T000000Z
DTEND:20090604T000000Z
ORGANIZER;CN="Cyrus Daboo":mailto:cyrus@example.com
ATTENDEE;CN="Wilfredo Sanchez Vega":mailto:wilfredo@example.com
FREEBUSY;FBTYPE=BUSY:20090602T110000Z/20090602T120000Z
FREEBUSY;FBTYPE=BUSY:20090603T170000Z/20090603T180000Z
END:VFREEBUSY
END:VCALENDAR
</C:calendar-data>
</C:response>
<C:response>
<C:recipient>
<D:href>mailto:bernard@example.net</D:href>
</C:recipient>
<C:request-status>2.0;Success</C:request-status>
<C:calendar-data>BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp.//CalDAV Server//EN
METHOD:REPLY
BEGIN:VFREEBUSY
UID:4FD3AD926350
DTSTAMP:20090602T200733Z
DTSTART:20090602T000000Z
DTEND:20090604T000000Z
ORGANIZER;CN="Cyrus Daboo":mailto:cyrus@example.com
ATTENDEE;CN="Bernard Desruisseaux":mailto:bernard@example.net
FREEBUSY;FBTYPE=BUSY:20090602T150000Z/20090602T160000Z
FREEBUSY;FBTYPE=BUSY:20090603T090000Z/20090603T100000Z
FREEBUSY;FBTYPE=BUSY:20090603T180000Z/20090603T190000Z
END:VFREEBUSY
END:VCALENDAR
</C:calendar-data>
</C:response>
<C:response>
<C:recipient>
<D:href>mailto:mike@example.org</D:href>
</C:recipient>
<C:request-status>3.7;Invalid calendar user</C:request-status>
</C:response>
</C:schedule-response>`

		request.post.mockImplementation(() => {
			return Promise.resolve({
				status: 207,
				body: response,
				xhr: null
			})
		});

		return scheduleOutbox.freeBusyRequest(requestData).then((freeBusyData) => {
			expect(freeBusyData).toEqual({
				'mailto:wilfredo@example.com': {
					calendarData: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp.//CalDAV Server//EN
METHOD:REPLY
BEGIN:VFREEBUSY
UID:4FD3AD926350
DTSTAMP:20090602T200733Z
DTSTART:20090602T000000Z
DTEND:20090604T000000Z
ORGANIZER;CN="Cyrus Daboo":mailto:cyrus@example.com
ATTENDEE;CN="Wilfredo Sanchez Vega":mailto:wilfredo@example.com
FREEBUSY;FBTYPE=BUSY:20090602T110000Z/20090602T120000Z
FREEBUSY;FBTYPE=BUSY:20090603T170000Z/20090603T180000Z
END:VFREEBUSY
END:VCALENDAR
`,
					status: '2.0;Success',
					success: true
				},
				'mailto:bernard@example.net': {
					calendarData: `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Example Corp.//CalDAV Server//EN
METHOD:REPLY
BEGIN:VFREEBUSY
UID:4FD3AD926350
DTSTAMP:20090602T200733Z
DTSTART:20090602T000000Z
DTEND:20090604T000000Z
ORGANIZER;CN="Cyrus Daboo":mailto:cyrus@example.com
ATTENDEE;CN="Bernard Desruisseaux":mailto:bernard@example.net
FREEBUSY;FBTYPE=BUSY:20090602T150000Z/20090602T160000Z
FREEBUSY;FBTYPE=BUSY:20090603T090000Z/20090603T100000Z
FREEBUSY;FBTYPE=BUSY:20090603T180000Z/20090603T190000Z
END:VFREEBUSY
END:VCALENDAR
`,
					status: '2.0;Success',
					success: true
				},
				'mailto:mike@example.org': {
					calendarData: '',
					status: '3.7;Invalid calendar user',
					success: false
				}
			});

			expect(request.post).toHaveBeenCalledTimes(1)
			expect(request.post).toHaveBeenCalledWith('/foo/bar/folder/', {
				'Content-Type': 'text/calendar; charset="utf-8"'
			}, requestData);
		}).catch(() => {
			assert.fail('Calendar findAllVObjects was not supposed to assert.fail');
		});

	})

});
