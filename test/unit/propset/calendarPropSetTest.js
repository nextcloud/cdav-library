/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { describe, expect, it } from "vitest";

import calendarPropSet from "../../../src/propset/calendarPropSet.js";

describe('Calendar prop-set', () => {
	it('should ignore unknown properties', () => {
		expect(calendarPropSet({
			'{Foo:}bar': 123
		})).toEqual([]);
	});

	it('should serialize {http://apple.com/ns/ical/}calendar-order correctly', () => {
		expect(calendarPropSet({
			'{Foo:}bar': 123,
			'{http://apple.com/ns/ical/}calendar-order': 4
		})).toEqual([
			{
				name: ['http://apple.com/ns/ical/', 'calendar-order'],
				value: '4'
			}
		]);
	});

	it('should serialize {http://apple.com/ns/ical/}calendar-color correctly', () => {
		expect(calendarPropSet({
			'{Foo:}bar': 123,
			'{http://apple.com/ns/ical/}calendar-color': '#AABBCC'
		})).toEqual([
			{
				name: ['http://apple.com/ns/ical/', 'calendar-color'],
				value: '#AABBCC'
			}
		]);
	});

	it('should serialize {http://calendarserver.org/ns/}source correctly', () => {
		expect(calendarPropSet({
			'{Foo:}bar': 123,
			'{http://calendarserver.org/ns/}source': 'http://foo.bar'
		})).toEqual([
			{
				name: ['http://calendarserver.org/ns/', 'source'],
				children: [
					{
						name: ['DAV:', 'href'],
						value: 'http://foo.bar'
					}
				]
			}
		]);
	});

	it('should serialize {urn:ietf:params:xml:ns:caldav}calendar-description correctly', () => {
		expect(calendarPropSet({
			'{Foo:}bar': 123,
			'{urn:ietf:params:xml:ns:caldav}calendar-description': 'New description for calendar'
		})).toEqual([
			{
				name: ['urn:ietf:params:xml:ns:caldav', 'calendar-description'],
				value: 'New description for calendar'
			}
		]);
	});

	it('should serialize {urn:ietf:params:xml:ns:caldav}calendar-timezone correctly', () => {
		expect(calendarPropSet({
			'{Foo:}bar': 123,
			'{urn:ietf:params:xml:ns:caldav}calendar-timezone': 'BEGIN:TIMEZONE...'
		})).toEqual([
			{
				name: ['urn:ietf:params:xml:ns:caldav', 'calendar-timezone'],
				value: 'BEGIN:TIMEZONE...'
			}
		]);
	});

	it('should serialize {http://owncloud.org/ns}calendar-enabled correctly - enabled', () => {
		expect(calendarPropSet({
			'{Foo:}bar': 123,
			'{http://owncloud.org/ns}calendar-enabled': true
		})).toEqual([
			{
				name: ['http://owncloud.org/ns', 'calendar-enabled'],
				value: '1'
			}
		]);
	});

	it('should serialize {http://owncloud.org/ns}calendar-enabled correctly - disabled', () => {
		expect(calendarPropSet({
			'{Foo:}bar': 123,
			'{http://owncloud.org/ns}calendar-enabled': false
		})).toEqual([
			{
				name: ['http://owncloud.org/ns', 'calendar-enabled'],
				value: '0'
			}
		]);
	});

	it('should serialize {urn:ietf:params:xml:ns:caldav}schedule-calendar-transp correctly - transparent', () => {
		expect(calendarPropSet({
			'{Foo:}bar': 123,
			'{urn:ietf:params:xml:ns:caldav}schedule-calendar-transp': 'transparent'
		})).toEqual([
			{
				name: ['urn:ietf:params:xml:ns:caldav', 'schedule-calendar-transp'],
				children: [
					{
						name: ['urn:ietf:params:xml:ns:caldav', 'transparent'],
					},
				],
			}
		]);
	});

	it('should serialize {urn:ietf:params:xml:ns:caldav}schedule-calendar-transp correctly - opaque', () => {
		expect(calendarPropSet({
			'{Foo:}bar': 123,
			'{urn:ietf:params:xml:ns:caldav}schedule-calendar-transp': 'opaque'
		})).toEqual([
			{
				name: ['urn:ietf:params:xml:ns:caldav', 'schedule-calendar-transp'],
				children: [
					{
						name: ['urn:ietf:params:xml:ns:caldav', 'opaque'],
					},
				],
			}
		]);
	});
});
