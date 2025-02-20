/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { assert, beforeEach, describe, expect, it, vi } from "vitest";

import { CalendarHome } from "../../../src/models/calendarHome.js";
import {DavCollection} from "../../../src/models/davCollection.js";
import {Calendar} from "../../../src/models/calendar.js";
import ScheduleInbox from "../../../src/models/scheduleInbox.js";
import ScheduleOutbox from "../../../src/models/scheduleOutbox.js";
import {Subscription} from "../../../src/models/subscription.js";
import * as XMLUtility from "../../../src/utility/xmlUtility.js";

describe('Calendar home model', () => {

	beforeEach(() => {
		XMLUtility.resetPrefixMap();
	});

	it('should inherit from DavCollection', () => {
		const parent = null;
		const request = {
            "propFind": vi.fn(),
            "put": vi.fn(),
            "delete": vi.fn()
        };
		const url = '/nextcloud/remote.php/dav/calendars/admin/';

		const calendarHome = new CalendarHome(parent, request, url, {});
		expect(calendarHome).toEqual(expect.any(DavCollection));
	});

	it('should find all CalDAV specific collections', () => {
		const parent = null;
		const request = {
            "propFind": vi.fn(),
            "put": vi.fn(),
            "delete": vi.fn(),
            "pathname": vi.fn()
        };
		const url = '/nextcloud/remote.php/dav/calendars/admin/';

		request.propFind.mockImplementation(() => {
			return Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				xhr: null
			});
		});

		request.pathname.mockImplementation((p) => p);

		const calendarHome = new CalendarHome(parent, request, url, {});
		return calendarHome.findAllCalDAVCollections().then(res => {
			expect(res.length).toEqual(5);
			expect(res[0]).toEqual(expect.any(Calendar));
			expect(res[0].url).toEqual('/nextcloud/remote.php/dav/calendars/admin/personal/');
			expect(res[1]).toEqual(expect.any(Calendar));
			expect(res[1].url).toEqual('/nextcloud/remote.php/dav/calendars/admin/contact_birthdays/');
			expect(res[2]).toEqual(expect.any(ScheduleInbox));
			expect(res[2].url).toEqual('/nextcloud/remote.php/dav/calendars/admin/inbox/');
			expect(res[3]).toEqual(expect.any(ScheduleOutbox));
			expect(res[3].url).toEqual('/nextcloud/remote.php/dav/calendars/admin/outbox/');
			expect(res[4]).toEqual(expect.any(Subscription));
			expect(res[4].url).toEqual('/nextcloud/remote.php/dav/calendars/admin/subscribed-calendar/');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/',
				expect.any(Array), 1);

		}).catch((e) => {
			console.log(e);
			assert.fail('CalendarHome findAllCalDAVCollections was not supposed to assert.fail');
		});
	});

	it('should find all calendars', () => {
		const parent = null;
		const request = {
            "propFind": vi.fn(),
            "put": vi.fn(),
            "delete": vi.fn(),
            "pathname": vi.fn()
        };
		const url = '/nextcloud/remote.php/dav/calendars/admin/';

		request.propFind.mockImplementation(() => {
			return Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				xhr: null
			});
		});

		request.pathname.mockImplementation((p) => p);

		const calendarHome = new CalendarHome(parent, request, url, {});
		return calendarHome.findAllCalendars().then(res => {
			expect(res.length).toEqual(2);
			expect(res[0]).toEqual(expect.any(Calendar));
			expect(res[0].url).toEqual('/nextcloud/remote.php/dav/calendars/admin/personal/');
			expect(res[1]).toEqual(expect.any(Calendar));
			expect(res[1].url).toEqual('/nextcloud/remote.php/dav/calendars/admin/contact_birthdays/');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/',
				expect.any(Array), 1);

		}).catch(() => {
			assert.fail('CalendarHome findAllCalendars was not supposed to assert.fail');
		});
	});

	it('should find all subscriptions', () => {
		const parent = null;
		const request = {
            "propFind": vi.fn(),
            "put": vi.fn(),
            "delete": vi.fn(),
            "pathname": vi.fn()
        };
		const url = '/nextcloud/remote.php/dav/calendars/admin/';

		request.propFind.mockImplementation(() => {
			return Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				xhr: null
			});
		});

		request.pathname.mockImplementation((p) => p);

		const calendarHome = new CalendarHome(parent, request, url, {});
		return calendarHome.findAllSubscriptions().then(res => {
			expect(res.length).toEqual(1);
			expect(res[0]).toEqual(expect.any(Subscription));
			expect(res[0].url).toEqual('/nextcloud/remote.php/dav/calendars/admin/subscribed-calendar/');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/',
				expect.any(Array), 1);

		}).catch(() => {
			assert.fail('CalendarHome findAllSubscriptions was not supposed to assert.fail');
		});
	});

	it('should find all schedule inboxes', () => {
		const parent = null;
		const request = {
            "propFind": vi.fn(),
            "put": vi.fn(),
            "delete": vi.fn(),
            "pathname": vi.fn()
        };
		const url = '/nextcloud/remote.php/dav/calendars/admin/';

		request.propFind.mockImplementation(() => {
			return Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				xhr: null
			});
		});

		request.pathname.mockImplementation((p) => p);

		const calendarHome = new CalendarHome(parent, request, url, {});
		return calendarHome.findAllScheduleInboxes().then(res => {
			expect(res.length).toEqual(1);
			expect(res[0]).toEqual(expect.any(ScheduleInbox));
			expect(res[0].url).toEqual('/nextcloud/remote.php/dav/calendars/admin/inbox/');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/',
				expect.any(Array), 1);

		}).catch(() => {
			assert.fail('CalendarHome findAllScheduleInboxes was not supposed to assert.fail');
		});
	});

	it('should find all schedule outboxes', () => {
		const parent = null;
		const request = {
            "propFind": vi.fn(),
            "put": vi.fn(),
            "delete": vi.fn(),
            "pathname": vi.fn()
        };
		const url = '/nextcloud/remote.php/dav/calendars/admin/';

		request.propFind.mockImplementation(() => {
			return Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				xhr: null
			});
		});

		request.pathname.mockImplementation((p) => p);

		const calendarHome = new CalendarHome(parent, request, url, {});
		return calendarHome.findAllScheduleOutboxes().then(res => {
			expect(res.length).toEqual(1);
			expect(res[0]).toEqual(expect.any(ScheduleOutbox));
			expect(res[0].url).toEqual('/nextcloud/remote.php/dav/calendars/admin/outbox/');

			expect(request.propFind).toHaveBeenCalledTimes(1);
			expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/',
				expect.any(Array), 1);

		}).catch(() => {
			assert.fail('CalendarHome findAllScheduleOutboxes was not supposed to assert.fail');
		});
	});

	it('should create a calendar collection', () => {
		const parent = null;
		const request = {
            "propFind": vi.fn(),
            "put": vi.fn(),
            "delete": vi.fn(),
            "pathname": vi.fn(),
            "mkCol": vi.fn()
        };
		const url = '/nextcloud/remote.php/dav/calendars/admin/';

		request.propFind.mockReturnValueOnce(Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				xhr: null
			})).mockReturnValueOnce(Promise.resolve({
				status: 207,
				body: {
					"{DAV:}resourcetype" : [
						"{DAV:}collection",
						"{urn:ietf:params:xml:ns:caldav}calendar"
					],
					"{DAV:}displayname" : "personal 123 456",
					"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
					"{DAV:}sync-token" : "http://sabre.io/ns/sync/19",
				},
				xhr: null
			}));

		request.mkCol.mockImplementation(() => {
			return Promise.resolve({
				status: 201,
				body: null,
				xhr: null
			})
		});

		request.pathname.mockImplementation((p) => p);

		const calendarHome = new CalendarHome(parent, request, url, {});
		return calendarHome.findAllScheduleOutboxes().then(() => {
			return calendarHome.createCalendarCollection('inbox', '#FFFFFF').then((res) => {
				expect(res).toEqual(expect.any(Calendar));
				expect(res.url).toEqual('/nextcloud/remote.php/dav/calendars/admin/inbox-1/');

				expect(request.propFind).toHaveBeenCalledTimes(2);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/', expect.any(Array), 1);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/inbox-1/', expect.any(Array), 0);

				expect(request.mkCol).toHaveBeenCalledTimes(1);
				expect(request.mkCol).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/inbox-1', {},
					'<x0:mkcol xmlns:x0="DAV:"><x0:set><x0:prop><x0:resourcetype><x0:collection/><x1:calendar xmlns:x1="urn:ietf:params:xml:ns:caldav"/></x0:resourcetype><x0:displayname>inbox</x0:displayname><x2:calendar-color xmlns:x2="http://apple.com/ns/ical/">#FFFFFF</x2:calendar-color><x3:calendar-enabled xmlns:x3="http://owncloud.org/ns">1</x3:calendar-enabled></x0:prop></x0:set></x0:mkcol>');
			}).catch(() => {
				assert.fail('CalendarHome createCalendarCollection was not supposed to assert.fail');
			});
		}).catch(() => {
			assert.fail('CalendarHome createCalendarCollection was not supposed to assert.fail');
		});
	});

	it('should create a calendar collection with additional parameters', () => {
		const parent = null;
		const request = {
            "propFind": vi.fn(),
            "put": vi.fn(),
            "delete": vi.fn(),
            "pathname": vi.fn(),
            "mkCol": vi.fn()
        };
		const url = '/nextcloud/remote.php/dav/calendars/admin/';

		request.propFind.mockReturnValueOnce(Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				xhr: null
			})).mockReturnValueOnce(Promise.resolve({
				status: 207,
				body: {
					"{DAV:}resourcetype" : [
						"{DAV:}collection",
						"{urn:ietf:params:xml:ns:caldav}calendar"
					],
					"{DAV:}displayname" : "personal 123 456",
					"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
					"{DAV:}sync-token" : "http://sabre.io/ns/sync/19",
				},
				xhr: null
			}));

		request.mkCol.mockImplementation(() => {
			return Promise.resolve({
				status: 201,
				body: null,
				xhr: null
			})
		});

		request.pathname.mockImplementation((p) => p);

		const calendarHome = new CalendarHome(parent, request, url, {});
		return calendarHome.findAllScheduleOutboxes().then(() => {
			return calendarHome.createCalendarCollection('inbox', '#FFFFFF', ['VEVENT', 'VJOURNAL'], 99).then((res) => {
				expect(res).toEqual(expect.any(Calendar));
				expect(res.url).toEqual('/nextcloud/remote.php/dav/calendars/admin/inbox-1/');

				expect(request.propFind).toHaveBeenCalledTimes(2);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/', expect.any(Array), 1);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/inbox-1/', expect.any(Array), 0);

				expect(request.mkCol).toHaveBeenCalledTimes(1);
				expect(request.mkCol).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/inbox-1', {},
					'<x0:mkcol xmlns:x0="DAV:"><x0:set><x0:prop><x0:resourcetype><x0:collection/><x1:calendar xmlns:x1="urn:ietf:params:xml:ns:caldav"/></x0:resourcetype><x0:displayname>inbox</x0:displayname><x2:calendar-color xmlns:x2="http://apple.com/ns/ical/">#FFFFFF</x2:calendar-color><x3:calendar-enabled xmlns:x3="http://owncloud.org/ns">1</x3:calendar-enabled><x1:supported-calendar-component-set xmlns:x1="urn:ietf:params:xml:ns:caldav"><x1:comp name="VEVENT"/><x1:comp name="VJOURNAL"/></x1:supported-calendar-component-set><x2:calendar-order xmlns:x2="http://apple.com/ns/ical/">99</x2:calendar-order></x0:prop></x0:set></x0:mkcol>');
			}).catch(() => {
				assert.fail('CalendarHome createCalendarCollection was not supposed to assert.fail');
			});
		}).catch(() => {
			assert.fail('CalendarHome createCalendarCollection was not supposed to assert.fail');
		});
	});

	it('should create a calendar collection with additional parameters and timezone', () => {
		const parent = null;
		const request = {
            "propFind": vi.fn(),
            "put": vi.fn(),
            "delete": vi.fn(),
            "pathname": vi.fn(),
            "mkCol": vi.fn()
        };
		const url = '/nextcloud/remote.php/dav/calendars/admin/';

		request.propFind.mockReturnValueOnce(Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				xhr: null
			})).mockReturnValueOnce(Promise.resolve({
				status: 207,
				body: {
					"{DAV:}resourcetype" : [
						"{DAV:}collection",
						"{urn:ietf:params:xml:ns:caldav}calendar"
					],
					"{DAV:}displayname" : "personal 123 456",
					"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
					"{DAV:}sync-token" : "http://sabre.io/ns/sync/19",
					"{urn:ietf:params:xml:ns:caldav}calendar": "FOO",
				},
				xhr: null
			}));

		request.mkCol.mockImplementation(() => {
			return Promise.resolve({
				status: 201,
				body: null,
				xhr: null
			})
		});

		request.pathname.mockImplementation((p) => p);

		const calendarHome = new CalendarHome(parent, request, url, {});
		return calendarHome.findAllScheduleOutboxes().then(() => {
			return calendarHome.createCalendarCollection('inbox', '#FFFFFF', ['VEVENT', 'VJOURNAL'], 99, 'ABC').then((res) => {
				expect(res).toEqual(expect.any(Calendar));
				expect(res.url).toEqual('/nextcloud/remote.php/dav/calendars/admin/inbox-1/');

				expect(request.propFind).toHaveBeenCalledTimes(2);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/', expect.any(Array), 1);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/inbox-1/', expect.any(Array), 0);

				expect(request.mkCol).toHaveBeenCalledTimes(1);
				expect(request.mkCol).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/inbox-1', {},
					'<x0:mkcol xmlns:x0="DAV:"><x0:set><x0:prop><x0:resourcetype><x0:collection/><x1:calendar xmlns:x1="urn:ietf:params:xml:ns:caldav"/></x0:resourcetype><x0:displayname>inbox</x0:displayname><x2:calendar-color xmlns:x2="http://apple.com/ns/ical/">#FFFFFF</x2:calendar-color><x3:calendar-enabled xmlns:x3="http://owncloud.org/ns">1</x3:calendar-enabled><x1:calendar-timezone xmlns:x1="urn:ietf:params:xml:ns:caldav">ABC</x1:calendar-timezone><x1:supported-calendar-component-set xmlns:x1="urn:ietf:params:xml:ns:caldav"><x1:comp name="VEVENT"/><x1:comp name="VJOURNAL"/></x1:supported-calendar-component-set><x2:calendar-order xmlns:x2="http://apple.com/ns/ical/">99</x2:calendar-order></x0:prop></x0:set></x0:mkcol>');
			}).catch(() => {
				assert.fail('CalendarHome createCalendarCollection was not supposed to assert.fail');
			});
		}).catch(() => {
			assert.fail('CalendarHome createCalendarCollection was not supposed to assert.fail');
		});
	});

	it('should create a subscribed collection', () => {
		const parent = null;
		const request = {
            "propFind": vi.fn(),
            "put": vi.fn(),
            "delete": vi.fn(),
            "pathname": vi.fn(),
            "mkCol": vi.fn()
        };
		const url = '/nextcloud/remote.php/dav/calendars/admin/';

		request.propFind.mockReturnValueOnce(Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				xhr: null
			})).mockReturnValueOnce(Promise.resolve({
				status: 207,
				body: {
					"{DAV:}resourcetype" : [
						"{DAV:}collection",
						"{urn:ietf:params:xml:ns:caldav}calendar"
					],
					"{DAV:}displayname" : "personal 123 456",
					"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
					"{DAV:}sync-token" : "http://sabre.io/ns/sync/19",
				},
				xhr: null
			}));

		request.mkCol.mockImplementation(() => {
			return Promise.resolve({
				status: 201,
				body: null,
				xhr: null
			})
		});

		request.pathname.mockImplementation((p) => p);

		const calendarHome = new CalendarHome(parent, request, url, {});
		return calendarHome.findAllScheduleInboxes().then(() => {
			return calendarHome.createSubscribedCollection('outbox', '#FFFFFF', 'https://foo/bar').then((res) => {
				expect(res).toEqual(expect.any(Calendar));
				expect(res.url).toEqual('/nextcloud/remote.php/dav/calendars/admin/outbox-1/');

				expect(request.propFind).toHaveBeenCalledTimes(2);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/', expect.any(Array), 1);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/outbox-1/', expect.any(Array), 0);

				expect(request.mkCol).toHaveBeenCalledTimes(1);
				expect(request.mkCol).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/outbox-1', {},
					'<x0:mkcol xmlns:x0="DAV:"><x0:set><x0:prop><x0:resourcetype><x0:collection/><x1:subscribed xmlns:x1="http://calendarserver.org/ns/"/></x0:resourcetype><x0:displayname>outbox</x0:displayname><x2:calendar-color xmlns:x2="http://apple.com/ns/ical/">#FFFFFF</x2:calendar-color><x3:calendar-enabled xmlns:x3="http://owncloud.org/ns">1</x3:calendar-enabled><x1:source xmlns:x1="http://calendarserver.org/ns/"><x0:href>https://foo/bar</x0:href></x1:source></x0:prop></x0:set></x0:mkcol>');
			}).catch(() => {
				assert.fail('CalendarHome createSubscribedCollection was not supposed to assert.fail');
			});
		}).catch(() => {
			assert.fail('CalendarHome createSubscribedCollection was not supposed to assert.fail');
		});
	});

	it('should create a subscribed collection with additional parameters', () => {
		const parent = null;
		const request = {
            "propFind": vi.fn(),
            "put": vi.fn(),
            "delete": vi.fn(),
            "pathname": vi.fn(),
            "mkCol": vi.fn()
        };
		const url = '/nextcloud/remote.php/dav/calendars/admin/';

		request.propFind.mockReturnValueOnce(Promise.resolve({
				status: 207,
				body: getDefaultPropFind(),
				xhr: null
			})).mockReturnValueOnce(Promise.resolve({
				status: 207,
				body: {
					"{DAV:}resourcetype" : [
						"{DAV:}collection",
						"{urn:ietf:params:xml:ns:caldav}calendar"
					],
					"{DAV:}displayname" : "personal 123 456",
					"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
					"{DAV:}sync-token" : "http://sabre.io/ns/sync/19",
				},
				xhr: null
			}));

		request.mkCol.mockImplementation(() => {
			return Promise.resolve({
				status: 201,
				body: null,
				xhr: null
			})
		});

		request.pathname.mockImplementation((p) => p);

		const calendarHome = new CalendarHome(parent, request, url, {});
		return calendarHome.findAllScheduleInboxes().then(() => {
			return calendarHome.createSubscribedCollection('outbox', '#FFFFFF', 'https://foo/bar', 101).then((res) => {
				expect(res).toEqual(expect.any(Calendar));
				expect(res.url).toEqual('/nextcloud/remote.php/dav/calendars/admin/outbox-1/');

				expect(request.propFind).toHaveBeenCalledTimes(2);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/', expect.any(Array), 1);
				expect(request.propFind).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/outbox-1/', expect.any(Array), 0);

				expect(request.mkCol).toHaveBeenCalledTimes(1);
				expect(request.mkCol).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/outbox-1', {},
					'<x0:mkcol xmlns:x0="DAV:"><x0:set><x0:prop><x0:resourcetype><x0:collection/><x1:subscribed xmlns:x1="http://calendarserver.org/ns/"/></x0:resourcetype><x0:displayname>outbox</x0:displayname><x2:calendar-color xmlns:x2="http://apple.com/ns/ical/">#FFFFFF</x2:calendar-color><x3:calendar-enabled xmlns:x3="http://owncloud.org/ns">1</x3:calendar-enabled><x1:source xmlns:x1="http://calendarserver.org/ns/"><x0:href>https://foo/bar</x0:href></x1:source><x2:calendar-order xmlns:x2="http://apple.com/ns/ical/">101</x2:calendar-order></x0:prop></x0:set></x0:mkcol>');
			}).catch(() => {
				assert.fail('CalendarHome createSubscribedCollection was not supposed to assert.fail');
			});
		}).catch(() => {
			assert.fail('CalendarHome createSubscribedCollection was not supposed to assert.fail');
		});
	});

	it.todo('should allow to search an entire calendar-home');

	it('should allow to enable the birthday-calendar', () => {
		const parent = null;
		const request = {
            "post": vi.fn()
        };
		const url = '/nextcloud/remote.php/dav/calendars/admin/';

		request.post.mockReturnValue(Promise.resolve({
				status: 204,
				body: null,
				xhr: null
			})
		);

		const calendarHome = new CalendarHome(parent, request, url, {});
		return calendarHome.enableBirthdayCalendar().then((res) => {
			expect(request.post).toHaveBeenCalledTimes(1);
			expect(request.post).toHaveBeenCalledWith('/nextcloud/remote.php/dav/calendars/admin/', {}, '<x0:enable-birthday-calendar xmlns:x0="http://nextcloud.com/ns"/>');

			expect(res).toEqual(undefined)
		});
	})

});

function getDefaultPropFind() {
	return {
		"/nextcloud/remote.php/dav/calendars/admin/" : {
			"{DAV:}resourcetype" : [
				"{DAV:}collection"
			],
			"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
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
				"{DAV:}read-current-user-privilege-set"
			]
		},
		"/nextcloud/remote.php/dav/calendars/admin/personal/" : {
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
		},
		"/nextcloud/remote.php/dav/calendars/admin/contact_birthdays/" : {
			"{DAV:}resourcetype" : [
				"{DAV:}collection",
				"{urn:ietf:params:xml:ns:caldav}calendar"
			],
			"{DAV:}displayname" : "Contact birthdays",
			"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
			"{DAV:}sync-token" : "http://sabre.io/ns/sync/2",
			"{DAV:}current-user-privilege-set" : [
				"{DAV:}write-properties",
				"{DAV:}read",
				"{DAV:}read-acl",
				"{DAV:}read-current-user-privilege-set",
				"{urn:ietf:params:xml:ns:caldav}read-free-busy"
			],
			"{http://owncloud.org/ns}invite" : [

			],
			"{http://calendarserver.org/ns/}allowed-sharing-modes" : [
				"{http://calendarserver.org/ns/}can-be-shared",
				"{http://calendarserver.org/ns/}can-be-shared",
				"{http://calendarserver.org/ns/}can-be-published",
				"{http://calendarserver.org/ns/}can-be-published"
			],
			"{http://apple.com/ns/ical/}calendar-order" : 3,
			"{http://apple.com/ns/ical/}calendar-color" : "#FFFFCA",
			"{http://calendarserver.org/ns/}getctag" : "http://sabre.io/ns/sync/2",
			"{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set" : [
				"VEVENT"
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
			"{http://nextcloud.com/ns}owner-displayname" : "admin"
		},
		"/nextcloud/remote.php/dav/calendars/admin/inbox/" : {
			"{DAV:}resourcetype" : [
				"{DAV:}collection",
				"{urn:ietf:params:xml:ns:caldav}schedule-inbox"
			],
			"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
			"{DAV:}current-user-privilege-set" : [
				"{urn:ietf:params:xml:ns:caldav}schedule-deliver",
				"{urn:ietf:params:xml:ns:caldav}schedule-deliver-invite",
				"{urn:ietf:params:xml:ns:caldav}schedule-deliver-reply",
				"{urn:ietf:params:xml:ns:caldav}schedule-query-freebusy",
				"{DAV:}unbind",
				"{DAV:}write-properties",
				"{DAV:}read",
				"{DAV:}read-acl",
				"{DAV:}read-current-user-privilege-set"
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
			]
		},
		"/nextcloud/remote.php/dav/calendars/admin/outbox/" : {
			"{DAV:}resourcetype" : [
				"{DAV:}collection",
				"{urn:ietf:params:xml:ns:caldav}schedule-outbox"
			],
			"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
			"{DAV:}current-user-privilege-set" : [
				"{DAV:}read",
				"{DAV:}read-acl",
				"{DAV:}read-current-user-privilege-set",
				"{urn:ietf:params:xml:ns:caldav}schedule-send",
				"{urn:ietf:params:xml:ns:caldav}schedule-send-invite",
				"{urn:ietf:params:xml:ns:caldav}schedule-send-reply",
				"{urn:ietf:params:xml:ns:caldav}schedule-send-freebusy",
				"{urn:ietf:params:xml:ns:caldav}schedule-post-vevent"
			]
		},
		"/nextcloud/remote.php/dav/calendars/admin/subscribed-calendar/": {
			"{DAV:}resourcetype" : [
				"{DAV:}collection",
				"{http://calendarserver.org/ns/}subscribed"
			],
			"{DAV:}owner" : "/nextcloud/remote.php/dav/principals/users/admin/",
			"{DAV:}current-user-privilege-set" : [
				"{DAV:}read",
				"{DAV:}read-acl",
				"{DAV:}read-current-user-privilege-set",
				"{urn:ietf:params:xml:ns:caldav}schedule-send",
				"{urn:ietf:params:xml:ns:caldav}schedule-send-invite",
				"{urn:ietf:params:xml:ns:caldav}schedule-send-reply",
				"{urn:ietf:params:xml:ns:caldav}schedule-send-freebusy",
				"{urn:ietf:params:xml:ns:caldav}schedule-post-vevent"
			]
		},
		'/nextcloud/remote.php/dav/calendars/admin/subscribed-calendar/d/': {
			'{DAV:}displayname': 'Foo Bar Bla Blub col0',
			'{DAV:}owner': 'https://foo/bar/',
			'{DAV:}resourcetype': ['{DAV:}collection'],
			'{DAV:}sync-token': 'https://foo/bar/token/3',
		},
	};
}
