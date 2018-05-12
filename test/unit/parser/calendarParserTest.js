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

import calendarParser from "../../../src/parser/calendarParser.js";

describe('Calendar Parser', () => {
	let davService;

	beforeAll(() => {
		davService = new dav.Client({
			xmlNamespaces: {
				'DAV:': 'd',
				'urn:ietf:params:xml:ns:caldav': 'c',
				'http://apple.com/ns/ical/': 'aapl',
				'http://owncloud.org/ns': 'oc',
				'http://nextcloud.com/ns': 'nc',
				'http://calendarserver.org/ns/': 'cs'
			}
		});
	});

	it('should ignore unknown properties', () => {
		const props = parseProps(dPropNoCalProp, davService);

		const result = calendarParser(props);
		expect(result).toEqual({});
	});

	it('should parse {http://apple.com/ns/ical/}calendar-order correctly', () => {
		const props = parseProps(dPropOrder, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{http://apple.com/ns/ical/}calendar-order': 0});
	});

	it('should parse {http://apple.com/ns/ical/}calendar-color correctly (#RGB)', () => {
		const props = parseProps(dPropColor, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{http://apple.com/ns/ical/}calendar-color': '#78e774'});
	});

	it('should parse {http://apple.com/ns/ical/}calendar-color correctly (#RGBA)', () => {
		const props = parseProps(dPropColorRGBA, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{http://apple.com/ns/ical/}calendar-color': '#78e774'});
	});

	it('should parse {http://calendarserver.org/ns/}getctag correctly', () => {
		const props = parseProps(dPropCTag, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{http://calendarserver.org/ns/}getctag': '3145'});
	});

	it('should parse {http://calendarserver.org/ns/}source correctly', () => {
		// TODO implement me
	});

	it('should parse {urn:ietf:params:xml:ns:caldav}calendar-description correctly', () => {
		const props = parseProps(dPropDescription, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{urn:ietf:params:xml:ns:caldav}calendar-description': 'Calendrier de Mathilde Desruisseaux'});
	});

	it('should parse {urn:ietf:params:xml:ns:caldav}calendar-timezone correctly', () => {
		const props = parseProps(dPropTimezone, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{urn:ietf:params:xml:ns:caldav}calendar-timezone': `BEGIN:VCALENDAR
PRODID:-//Example Corp.//CalDAV Client//EN
VERSION:2.0
BEGIN:VTIMEZONE
TZID:US-Eastern
LAST-MODIFIED:19870101T000000Z
BEGIN:STANDARD
DTSTART:19671029T020000
RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:Eastern Standard Time (US & Canada)
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:19870405T020000
RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=4
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:Eastern Daylight Time (US & Canada)
END:DAYLIGHT
END:VTIMEZONE
END:VCALENDAR`});
	});

	it('should parse {urn:ietf:params:xml:ns:caldav}supported-calendar-component-set correctly', () => {
		const props = parseProps(dPropSuppertedCalComp, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set': { vevent: true, vjournal: false, vtodo: true }});
	});

	it('should parse {urn:ietf:params:xml:ns:caldav}supported-calendar-data correctly', () => {
		const props = parseProps(dPropSuppertedCalData, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{urn:ietf:params:xml:ns:caldav}supported-calendar-data': [{'content-type': 'text/calendar', 'version': '2.0' }]});
	});

	it('should parse {urn:ietf:params:xml:ns:caldav}max-resource-size correctly', () => {
		const props = parseProps(dPropMaxResource, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{urn:ietf:params:xml:ns:caldav}max-resource-size': 102400});
	});

	it('should parse {urn:ietf:params:xml:ns:caldav}min-date-time correctly', () => {
		const props = parseProps(dPropMinDate, davService);

		const result = calendarParser(props);
		expect(result['{urn:ietf:params:xml:ns:caldav}min-date-time']).toEqual(jasmine.any(Date));
		expect(result['{urn:ietf:params:xml:ns:caldav}min-date-time'].toISOString()).toEqual('1900-01-01T00:00:00.000Z');
	});

	it('should parse {urn:ietf:params:xml:ns:caldav}max-date-time correctly', () => {
		const props = parseProps(dPropMaxDate, davService);

		const result = calendarParser(props);
		expect(result['{urn:ietf:params:xml:ns:caldav}max-date-time']).toEqual(jasmine.any(Date));
		expect(result['{urn:ietf:params:xml:ns:caldav}max-date-time'].toISOString()).toEqual('2049-12-31T23:59:59.000Z');
	});

	it('should parse {urn:ietf:params:xml:ns:caldav}max-instances correctly', () => {
		const props = parseProps(dPropMaxInstances, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{urn:ietf:params:xml:ns:caldav}max-instances': 100});
	});

	it('should parse {urn:ietf:params:xml:ns:caldav}max-attendees-per-instance correctly', () => {
		const props = parseProps(dPropMaxAttendees, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{urn:ietf:params:xml:ns:caldav}max-attendees-per-instance': 25});
	});

	it('should parse {urn:ietf:params:xml:ns:caldav}supported-collation-set correctly', () => {
		const props = parseProps(dPropCollationSet, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{urn:ietf:params:xml:ns:caldav}supported-collation-set': ['i;ascii-casemap', 'i;octet']});
	});

	it('should parse {http://owncloud.org/ns}calendar-enabled correctly - enabled', () => {
		const props = parseProps(dPropEnalbed, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{http://owncloud.org/ns}calendar-enabled': true});
	});

	it('should parse {http://owncloud.org/ns}calendar-enabled correctly - disabled', () => {
		const props = parseProps(dPropDisabled, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{http://owncloud.org/ns}calendar-enabled': false});
	});

	it('should parse {http://nextcloud.com/ns}owner-displayname correctly', () => {
		const props = parseProps(dPropOwnerDisplayname, davService);

		const result = calendarParser(props);
		expect(result).toEqual({'{http://nextcloud.com/ns}owner-displayname': 'Administrator'});
	});
});

function parseProps(str, davService) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(str, "application/xml");

	const resolver = function(foo) {
		for(let ii in davService.xmlNamespaces) {
			if (davService.xmlNamespaces[ii] === foo) {
				return ii;
			}
		}
	}.bind(this);

	const propIterator = doc.evaluate('d:prop/*', doc, resolver, XPathResult.ANY_TYPE, null);
	let propNode = propIterator.iterateNext();
	const props = {};
	while (propNode) {
		props['{' + propNode.namespaceURI + '}' + propNode.localName] = davService._parsePropNode(propNode);
		propNode = propIterator.iterateNext();
	}

	return props;
}

const dPropNoCalProp = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
</d:prop>
`;

const dPropOrder = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
    <x1:calendar-order xmlns:x1="http://apple.com/ns/ical/">0</x1:calendar-order>
</d:prop>
`;

const dPropColor = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
    <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/">#78e774</x1:calendar-color>
</d:prop>
`;

const dPropColorRGBA = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
    <x1:calendar-color xmlns:x1="http://apple.com/ns/ical/">#78e774FF</x1:calendar-color>
</d:prop>
`;

const dPropCTag = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
    <cs:getctag>3145</cs:getctag>
</d:prop>
`;

const dPropDescription = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
    <C:calendar-description xml:lang="fr-CA" xmlns:C="urn:ietf:params:xml:ns:caldav">Calendrier de Mathilde Desruisseaux</C:calendar-description>
</d:prop>
`;

const dPropTimezone = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
	<C:calendar-timezone xmlns:C="urn:ietf:params:xml:ns:caldav">BEGIN:VCALENDAR
PRODID:-//Example Corp.//CalDAV Client//EN
VERSION:2.0
BEGIN:VTIMEZONE
TZID:US-Eastern
LAST-MODIFIED:19870101T000000Z
BEGIN:STANDARD
DTSTART:19671029T020000
RRULE:FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
TZNAME:Eastern Standard Time (US &amp; Canada)
END:STANDARD
BEGIN:DAYLIGHT
DTSTART:19870405T020000
RRULE:FREQ=YEARLY;BYDAY=1SU;BYMONTH=4
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
TZNAME:Eastern Daylight Time (US &amp; Canada)
END:DAYLIGHT
END:VTIMEZONE
END:VCALENDAR</C:calendar-timezone>
</d:prop>
`;

const dPropSuppertedCalComp = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
    <cal:supported-calendar-component-set>
        <cal:comp name="VEVENT"/>
        <cal:comp name="VTODO"/>
    </cal:supported-calendar-component-set>
</d:prop>
`;

const dPropSuppertedCalData = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
	<C:supported-calendar-data xmlns:C="urn:ietf:params:xml:ns:caldav">
    	<C:calendar-data content-type="text/calendar" version="2.0"/>
    </C:supported-calendar-data>
</d:prop>
`;

const dPropMaxResource = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
	<C:max-resource-size xmlns:C="urn:ietf:params:xml:ns:caldav">102400</C:max-resource-size>
</d:prop>
`;

const dPropMaxDate = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
	<C:max-date-time xmlns:C="urn:ietf:params:xml:ns:caldav">20491231T235959Z</C:max-date-time>
</d:prop>
`;

const dPropMinDate = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
	<C:min-date-time xmlns:C="urn:ietf:params:xml:ns:caldav">19000101T000000Z</C:min-date-time>
</d:prop>
`;

const dPropMaxInstances = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
	<C:max-instances xmlns:C="urn:ietf:params:xml:ns:caldav">100</C:max-instances>
</d:prop>
`;

const dPropMaxAttendees = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
	<C:max-attendees-per-instance xmlns:C="urn:ietf:params:xml:ns:caldav">25</C:max-attendees-per-instance>
</d:prop>
`;

const dPropCollationSet = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
	<C:supported-collation-set xmlns:C="urn:ietf:params:xml:ns:caldav">
    	<C:supported-collation>i;ascii-casemap</C:supported-collation>
    	<C:supported-collation>i;octet</C:supported-collation>
    </C:supported-collation-set>
</d:prop>
`;

const dPropEnalbed = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
    <oc:calendar-enabled>1</oc:calendar-enabled>
</d:prop>
`;

const dPropDisabled = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
    <oc:calendar-enabled>0</oc:calendar-enabled>
</d:prop>
`;

const dPropOwnerDisplayname = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns" xmlns:nc="http://nextcloud.com/ns">
	<d:displayname>Privat</d:displayname>
	<nc:owner-displayname>Administrator</nc:owner-displayname>
</d:prop>
`;
