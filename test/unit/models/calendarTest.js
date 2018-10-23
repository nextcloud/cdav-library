/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * @author Georg Ehrke
 * @copyright 2018 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import {DavCollection} from "../../../src/models/davCollection.js";
import {Calendar} from "../../../src/models/calendar.js";
import {VObject} from "../../../src/models/vobject.js";
import * as NS from "../../../src/utility/namespaceUtility.js";
import * as XMLUtility from "../../../src/utility/xmlUtility.js";

describe('Calendar model', () => {

	beforeEach(() => {
		XMLUtility.resetPrefixMap();
	});

	it('should inherit from DavCollection / shareable / publishable', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		const calendar = new Calendar(parent, request, url, props);
		expect(calendar).toEqual(jasmine.any(DavCollection));
		expect(calendar.share).toEqual(jasmine.any(Function));
		expect(calendar.unshare).toEqual(jasmine.any(Function));
		expect(calendar.publish).toEqual(jasmine.any(Function));
		expect(calendar.unpublish).toEqual(jasmine.any(Function));
	});

	it('should inherit expose the property color', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		const calendar = new Calendar(parent, request, url, props);
		expect(calendar.color).toEqual('#FFFF00');
	});

	it('should inherit expose the property enabled', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		const calendar = new Calendar(parent, request, url, props);
		expect(calendar.enabled).toEqual(true);
	});

	it('should inherit expose the property order', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		const calendar = new Calendar(parent, request, url, props);
		expect(calendar.order).toEqual(2);
	});

	it('should inherit expose the property timezone', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		const calendar = new Calendar(parent, request, url, props);
		expect(calendar.timezone.split("\r\n").join("\n")).toEqual(`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Apple Inc.//Mac OS X 10.13.6//EN
CALSCALE:GREGORIAN
BEGIN:VTIMEZONE
TZID:Europe/Berlin
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
DTSTART:19810329T020000
TZNAME:CEST
TZOFFSETTO:+0200
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:+0200
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
DTSTART:19961027T030000
TZNAME:CET
TZOFFSETTO:+0100
END:STANDARD
END:VTIMEZONE
END:VCALENDAR
`.split("\r\n").join("\n"));
	});

	it('should inherit expose the property components', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete']);
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		const calendar = new Calendar(parent, request, url, props);
		expect(calendar.components).toEqual(['VEVENT', 'VTODO']);
	});

	it('should find all VObjects', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'pathname']);
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		request.propFind.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'/foo/bar/folder/a': getVEventProps(),
					'/foo/bar/folder/b': getVEventProps(),
					'/foo/bar/folder/c': {
						'{DAV:}owner': 'https://foo/bar/',
						'{DAV:}resourcetype': [],
						'{DAV:}sync-token': 'https://foo/bar/token/3',
						'{DAV:}getcontenttype': 'text/foo1; charset=utf8'
					},
				},
				xhr: null
			});
		});

		request.pathname.and.callFake((p) => p);

		const calendar = new Calendar(parent, request, url, props);
		return calendar.findAllVObjects().then((res) => {
			expect(res.length).toEqual(2);
			expect(res[0]).toEqual(jasmine.any(VObject));
			expect(res[0].url).toEqual('/foo/bar/folder/a');
			expect(res[1]).toEqual(jasmine.any(VObject));
			expect(res[1].url).toEqual('/foo/bar/folder/b');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/foo/bar/folder/', [
				['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype'],
				['DAV:', 'displayname'], ['DAV:', 'owner'], ['DAV:', 'resourcetype'],
				['DAV:', 'sync-token'], ['DAV:', 'current-user-privilege-set'],
				['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype'],
				['urn:ietf:params:xml:ns:caldav', 'calendar-data']], 1);
		}).catch(() => {
			fail('Calendar findAllVObjects was not supposed to fail');
		});
	});

	it('should find all VObjects filtered by component type', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'report', 'pathname']);
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		request.report.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'/foo/bar/folder/a': getVEventProps(),
					'/foo/bar/folder/b': getVEventProps()
				},
				xhr: null
			});
		});

		request.pathname.and.callFake((p) => p);

		const calendar = new Calendar(parent, request, url, props);
		return calendar.findByType('VEVENT').then((res) => {
			expect(res.length).toEqual(2);
			expect(res[0]).toEqual(jasmine.any(VObject));
			expect(res[0].url).toEqual('/foo/bar/folder/a');
			expect(res[1]).toEqual(jasmine.any(VObject));
			expect(res[1].url).toEqual('/foo/bar/folder/b');

			expect(request.report).toHaveBeenCalledTimes(1);
			expect(request.report).toHaveBeenCalledWith('/foo/bar/folder/', { Depth: '1' },
				'<x0:calendar-query xmlns:x0="urn:ietf:params:xml:ns:caldav"><x1:prop xmlns:x1="DAV:"><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x1:displayname/><x1:owner/><x1:resourcetype/><x1:sync-token/><x1:current-user-privilege-set/><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x0:calendar-data/></x1:prop><x0:comp-filter name="VCALENDAR"><x0:comp-filter name="VEVENT"/></x0:comp-filter></x0:calendar-query>');
		}).catch(() => {
			fail('Calendar findByType was not supposed to fail');
		});
	});

	it('should find all VObjects filtered by component types in time-range', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'report', 'pathname']);
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		request.report.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'/foo/bar/folder/b': getVEventProps()
				},
				xhr: null
			});
		});

		request.pathname.and.callFake((p) => p);

		const calendar = new Calendar(parent, request, url, props);
		return calendar.findByTypeInTimeRange('VEVENT', new Date(Date.UTC(2018, 9, 1, 0, 0, 0, 0)), new Date(Date.UTC(2018, 9, 31, 0, 0, 0, 0))).then((res) => {
			expect(res.length).toEqual(1);
			expect(res[0]).toEqual(jasmine.any(VObject));
			expect(res[0].url).toEqual('/foo/bar/folder/b');

			expect(request.report).toHaveBeenCalledTimes(1);
			expect(request.report).toHaveBeenCalledWith('/foo/bar/folder/', { Depth: '1' },
				'<x0:calendar-query xmlns:x0="urn:ietf:params:xml:ns:caldav"><x1:prop xmlns:x1="DAV:"><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x1:displayname/><x1:owner/><x1:resourcetype/><x1:sync-token/><x1:current-user-privilege-set/><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x0:calendar-data/></x1:prop><x0:comp-filter name="VCALENDAR"><x0:comp-filter name="VEVENT"><x0:time-range start="20181001T000000Z" end="20181031T000000Z"/></x0:comp-filter></x0:comp-filter></x0:calendar-query>');
		}).catch((e) => {
			console.log(e);
			fail('Calendar findByTypeInTimeRange was not supposed to fail');
		});
	});
	it('should create a VObject', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete' , 'pathname']);
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		request.put.and.callFake(() => {
			return Promise.resolve({
				status: 204,
				body: null,
				xhr: null,
			})
		});
		request.propFind.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: getVEventProps(),
				xhr: null
			});
		});
		request.pathname.and.callFake((p) => p);

		const calendar = new Calendar(parent, request, url, props);
		return calendar.createVObject('DATA123').then((res) => {
			expect(res).toEqual(jasmine.any(VObject));
			expect(res.url).toEqual(jasmine.any(String));
			expect(res.url.startsWith('/foo/bar/folder/')).toEqual(true);
			expect(res.url.endsWith('.ics')).toEqual(true);
			expect(res.etag).toEqual('"ce6062093e9d738a970c6242820fab7f"');

			expect(request.put).toHaveBeenCalledTimes(1);
			expect(request.put).toHaveBeenCalledWith(jasmine.any(String), { 'Content-Type': 'text/calendar; charset=utf-8' }, 'DATA123');
			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith(jasmine.any(String), [
				['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype'],
				['DAV:', 'displayname'], ['DAV:', 'owner'], ['DAV:', 'resourcetype'],
				['DAV:', 'sync-token'], ['DAV:', 'current-user-privilege-set'],
				['DAV:', 'getcontenttype'], ['DAV:', 'getetag'], ['DAV:', 'resourcetype'],
				['urn:ietf:params:xml:ns:caldav', 'calendar-data']], 0);
		}).catch(() => {
			fail('DavCollection update was not supposed to fail');
		});
	});

	it('should provide a calendar-query', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'report', 'pathname']);
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		request.report.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'/foo/bar/folder/a': getVEventProps()
				},
				xhr: null
			});
		});

		request.pathname.and.callFake((p) => p);

		// Example from https://tools.ietf.org/html/rfc4791#section-7.8.7
		const calendar = new Calendar(parent, request, url, props);
		return calendar.calendarQuery([{
			name: [NS.IETF_CALDAV, 'comp-filter'],
			attributes: [
				['name', 'VCALENDAR']
			],
			children: [{
				name: [NS.IETF_CALDAV, 'comp-filter'],
				attributes: [
					['name', 'VEVENT']
				],
				children: [{
					name: [NS.IETF_CALDAV, 'prop-filter'],
					attributes: [
						['name', 'ATTENDEE']
					],
					children: [{
						name: [NS.IETF_CALDAV, 'text-match'],
						attributes: [
							['collation', 'i;ascii-casemap']
						],
						value: 'mailto:lisa@example.com'
					}, {
						name: [NS.IETF_CALDAV, 'param-filter'],
						attributes: [
							['name', 'PARTSTAT']
						],
						children: [{
							name: [NS.IETF_CALDAV, 'text-match'],
							attributes: [
								['collation', 'i;ascii-casemap']
							],
							value: 'NEEDS-ACTION'
						}]
					}]
				}],
			}]
		}]).then((res) => {
			expect(res.length).toEqual(1);
			expect(res[0]).toEqual(jasmine.any(VObject));
			expect(res[0].url).toEqual('/foo/bar/folder/a');

			expect(request.report).toHaveBeenCalledTimes(1);
			expect(request.report).toHaveBeenCalledWith('/foo/bar/folder/', { Depth: '1' },
				'<x0:calendar-query xmlns:x0="urn:ietf:params:xml:ns:caldav"><x1:prop xmlns:x1="DAV:"><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x1:displayname/><x1:owner/><x1:resourcetype/><x1:sync-token/><x1:current-user-privilege-set/><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x0:calendar-data/></x1:prop><x0:comp-filter name="VCALENDAR"><x0:comp-filter name="VEVENT"><x0:prop-filter name="ATTENDEE"><x0:text-match collation="i;ascii-casemap">mailto:lisa@example.com</x0:text-match><x0:param-filter name="PARTSTAT"><x0:text-match collation="i;ascii-casemap">NEEDS-ACTION</x0:text-match></x0:param-filter></x0:prop-filter></x0:comp-filter></x0:comp-filter></x0:calendar-query>');
		}).catch(() => {
			fail('Calendar calendarQuery was not supposed to fail');
		});
	});

	it('should provide a calendar-multiget', () => {
		const parent = jasmine.createSpyObj('DavCollection', ['findAll', 'findAllByFilter', 'find',
			'createCollection', 'createObject', 'update', 'delete', 'isReadable', 'isWriteable']);
		const request = jasmine.createSpyObj('Request', ['propFind', 'put', 'delete', 'report', 'pathname']);
		const url = '/foo/bar/folder';
		const props = returnDefaultProps();

		request.report.and.callFake(() => {
			return Promise.resolve({
				status: 207,
				body: {
					'/foo/bar/folder/a': getVEventProps(),
					'/foo/bar/folder/b': getVEventProps()
				},
				xhr: null
			});
		});

		request.pathname.and.callFake((p) => p);

		const calendar = new Calendar(parent, request, url, props);
		return calendar.calendarMultiget(['/foo/bar/folder/a', '/foo/bar/folder/b']).then((res) => {
			expect(res.length).toEqual(2);
			expect(res[0]).toEqual(jasmine.any(VObject));
			expect(res[0].url).toEqual('/foo/bar/folder/a');
			expect(res[1]).toEqual(jasmine.any(VObject));
			expect(res[1].url).toEqual('/foo/bar/folder/b');

			expect(request.report).toHaveBeenCalledTimes(1);
			expect(request.report).toHaveBeenCalledWith('/foo/bar/folder/', { Depth: '1' },
				'<x0:calendar-multiget xmlns:x0="urn:ietf:params:xml:ns:caldav"><x1:prop xmlns:x1="DAV:"><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x1:displayname/><x1:owner/><x1:resourcetype/><x1:sync-token/><x1:current-user-privilege-set/><x1:getcontenttype/><x1:getetag/><x1:resourcetype/><x0:calendar-data/></x1:prop><x1:href xmlns:x1="DAV:">/foo/bar/folder/a</x1:href><x1:href xmlns:x1="DAV:">/foo/bar/folder/b</x1:href></x0:calendar-multiget>');
		}).catch(() => {
			fail('Calendar calendar-multiget was not supposed to fail');
		});
	});

	it('should provide a freeBusyQuery', () => {
		pending('to be implemented ...');
	});

});

function returnDefaultProps() {
	return {
		"{DAV:}resourcetype" : [
			"{DAV:}collection",
			"{urn:ietf:params:xml:ns:caldav}calendar"
		],
		"{DAV:}displayname" : "rennamed personal 123",
		"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
		"{DAV:}sync-token" : "http://sabre.io/ns/sync/19",
		"{DAV:}current-user-privilege-set" : [
			"{DAV:}write",
			"{DAV:}write-properties",
			"{DAV:}write-content",
			"{DAV:}unlock",
			"{DAV:}bind",
			"{DAV:}unbind",
			"{DAV:}write-acl",
			"{DAV:}read",
			"{DAV:}read-acl",
			"{DAV:}read-current-user-privilege-set",
			"{urn:ietf:params:xml:ns:caldav}read-free-busy"
		],
		"{http://owncloud.org/ns}invite" : [
			{
				"href" : "principal:principals/users/admin",
				"common-name" : "admin",
				"invite-accepted" : true,
				"access" : [
					"{http://owncloud.org/ns}read-write"
				]
			},
			{
				"href" : "principal:principals/groups/admin",
				"common-name" : "",
				"invite-accepted" : true,
				"access" : [
					"{http://owncloud.org/ns}read-write"
				]
			}
		],
		"{http://calendarserver.org/ns/}allowed-sharing-modes" : [
			"{http://calendarserver.org/ns/}can-be-shared",
			"{http://calendarserver.org/ns/}can-be-shared",
			"{http://calendarserver.org/ns/}can-be-published",
			"{http://calendarserver.org/ns/}can-be-published"
		],
		"{http://calendarserver.org/ns/}publish-url" : "http://all.local/nextcloud/remote.php/dav/public-calendars/Fnn4DyyW6fidF3Y8",
		"{http://apple.com/ns/ical/}calendar-order" : 2,
		"{http://apple.com/ns/ical/}calendar-color" : "#FFFF00",
		"{http://calendarserver.org/ns/}getctag" : "http://sabre.io/ns/sync/19",
		"{urn:ietf:params:xml:ns:caldav}calendar-timezone" : "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Apple Inc.//Mac OS X 10.13.6//EN\r\nCALSCALE:GREGORIAN\r\nBEGIN:VTIMEZONE\r\nTZID:Europe/Berlin\r\nBEGIN:DAYLIGHT\r\nTZOFFSETFROM:+0100\r\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\r\nDTSTART:19810329T020000\r\nTZNAME:CEST\r\nTZOFFSETTO:+0200\r\nEND:DAYLIGHT\r\nBEGIN:STANDARD\r\nTZOFFSETFROM:+0200\r\nRRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\r\nDTSTART:19961027T030000\r\nTZNAME:CET\r\nTZOFFSETTO:+0100\r\nEND:STANDARD\r\nEND:VTIMEZONE\r\nEND:VCALENDAR\r\n",
		"{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set" : [
			"VEVENT",
			"VTODO"
		],
		"{urn:ietf:params:xml:ns:caldav}supported-calendar-data" : [
			{
				"content-type" : "text/calendar",
				"version" : "2.0"
			},
			{
				"content-type" : "application/calendar+json",
				"version" : ""
			}
		],
		"{urn:ietf:params:xml:ns:caldav}max-resource-size" : 10000000,
		"{urn:ietf:params:xml:ns:caldav}supported-collation-set" : [
			"i;ascii-casemap",
			"i;octet",
			"i;unicode-casemap"
		],
		"{urn:ietf:params:xml:ns:caldav}schedule-calendar-transp" : "opaque",
		"{http://owncloud.org/ns}calendar-enabled" : true,
		"{http://nextcloud.com/ns}owner-displayname" : "admin"
	};
}

function getVEventProps() {
	return {
		"{DAV:}getcontenttype" : "text/calendar; charset=utf-8; component=vevent",
		"{DAV:}getetag" : "\"ce6062093e9d738a970c6242820fab7f\"",
		"{DAV:}resourcetype" : [

		],
		"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
		"{DAV:}current-user-privilege-set" : [
			"{DAV:}write",
			"{DAV:}write-properties",
			"{DAV:}write-content",
			"{DAV:}unlock",
			"{DAV:}write-acl",
			"{DAV:}read",
			"{DAV:}read-acl",
			"{DAV:}read-current-user-privilege-set"
		],
		"{urn:ietf:params:xml:ns:caldav}calendar-data" : "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Apple Inc.//Mac OS X 10.13.6//EN\nCALSCALE:GREGORIAN\nBEGIN:VTIMEZONE\nTZID:Europe/Berlin\nBEGIN:DAYLIGHT\nTZOFFSETFROM:+0100\nRRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU\nDTSTART:19810329T020000\nTZNAME:CEST\nTZOFFSETTO:+0200\nEND:DAYLIGHT\nBEGIN:STANDARD\nTZOFFSETFROM:+0200\nRRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU\nDTSTART:19961027T030000\nTZNAME:CET\nTZOFFSETTO:+0100\nEND:STANDARD\nEND:VTIMEZONE\nBEGIN:VEVENT\nCREATED:20180818T103822Z\nUID:60A6AD9C-7C77-4199-BF21-84B515C38087\nDTEND;TZID=Europe/Berlin:20180823T100000\nTRANSP:OPAQUE\nX-APPLE-TRAVEL-ADVISORY-BEHAVIOR:AUTOMATIC\nSUMMARY:foo bar 123\nDTSTART;TZID=Europe/Berlin:20180823T090000\nDTSTAMP:20180818T103827Z\nSEQUENCE:0\nBEGIN:VALARM\nX-WR-ALARMUID:B471E159-1F01-4AAA-A220-63FAFC81DED9\nUID:B471E159-1F01-4AAA-A220-63FAFC81DED9\nTRIGGER:-PT30M\nX-APPLE-DEFAULT-ALARM:TRUE\nATTACH;VALUE=URI:Basso\nACTION:AUDIO\nEND:VALARM\nEND:VEVENT\nEND:VCALENDAR\n"
	};
}
