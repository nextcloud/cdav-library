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
});
