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

import davCollectionParser from "../../../src/parser/davCollectionParser.js";

describe('Dav collection Parser', () => {
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
		const props = parseProps(dPropNoDav, davService);

		const result = davCollectionParser(props);
		expect(result).toEqual({});
	});

	it('should parse {DAV:}acl correctly', () => {
		const props = parseProps(dPropACL, davService);

		const result = davCollectionParser(props);
		expect(result).toEqual({'{DAV:}acl': [{"principal":{"type":"href","href":"/remote.php/dav/principals/users/admin/"},"grant":["{DAV:}read","{DAV:}write-properties","{DAV:}unbind"],"deny":[],"protect":[],"inherit":[]},{"principal":{"type":"href","href":"/remote.php/dav/principals/users/admin/calendar-proxy-read/"},"grant":["{DAV:}read"],"deny":[],"protect":[],"inherit":[]},{"principal":{"type":"href","href":"/remote.php/dav/principals/users/admin/calendar-proxy-write/"},"grant":["{DAV:}read","{DAV:}unbind"],"deny":[],"protect":[],"inherit":[]},{"principal":{"type":"authenticated"},"grant":["{urn:ietf:params:xml:ns:caldav}schedule-deliver-invite","{urn:ietf:params:xml:ns:caldav}schedule-deliver-reply"],"deny":[],"protect":[],"inherit":[]}]});
	});

	it('should parse {DAV:}displayname correctly', () => {
		const props = parseProps(dPropDisplayname, davService);

		const result = davCollectionParser(props);
		expect(result).toEqual({'{DAV:}displayname': 'Privat'});
	});

	it('should parse {DAV:}owner correctly', () => {
		const props = parseProps(dPropOwner, davService);

		const result = davCollectionParser(props);
		expect(result).toEqual({'{DAV:}owner': '/remote.php/dav/principals/users/admin/'});
	});

	it('should parse {DAV:}resourcetype correctly', () => {
		const props = parseProps(dPropResourcetype, davService);

		const result = davCollectionParser(props);
		expect(result).toEqual({'{DAV:}resourcetype': ['{DAV:}collection', '{urn:ietf:params:xml:ns:caldav}calendar']});
	});

	it('should parse {DAV:}sync-token correctly', () => {
		const props = parseProps(dPropSyncToken, davService);

		const result = davCollectionParser(props);
		expect(result).toEqual({'{DAV:}sync-token': 'http://sabredav.org/ns/sync-token/3145'});
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

const dPropNoDav = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
    <cal:supported-calendar-component-set>
        <cal:comp name="VEVENT"/>
        <cal:comp name="VTODO"/>
    </cal:supported-calendar-component-set>
</d:prop>
`;

const dPropACL = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
    <cal:supported-calendar-component-set>
        <cal:comp name="VEVENT"/>
        <cal:comp name="VTODO"/>
    </cal:supported-calendar-component-set>
    <d:acl>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:write-properties/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:unbind/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-read/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-write/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:read/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:href>/remote.php/dav/principals/users/admin/calendar-proxy-write/</d:href>
      </d:principal>
      <d:grant>
       <d:privilege>
        <d:unbind/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:authenticated/>
      </d:principal>
      <d:grant>
       <d:privilege>
        <cal:schedule-deliver-invite/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
     <d:ace>
      <d:principal>
       <d:authenticated/>
      </d:principal>
      <d:grant>
       <d:privilege>
        <cal:schedule-deliver-reply/>
       </d:privilege>
      </d:grant>
      <d:protected/>
     </d:ace>
    </d:acl>
</d:prop>
`;

const dPropDisplayname = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
    <cal:supported-calendar-component-set>
        <cal:comp name="VEVENT"/>
        <cal:comp name="VTODO"/>
    </cal:supported-calendar-component-set>
    <d:displayname>Privat</d:displayname>
</d:prop>
`;

const dPropOwner = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
    <cal:supported-calendar-component-set>
        <cal:comp name="VEVENT"/>
        <cal:comp name="VTODO"/>
    </cal:supported-calendar-component-set>
    <d:owner>
     <d:href>/remote.php/dav/principals/users/admin/</d:href>
    </d:owner>
</d:prop>
`;

const dPropResourcetype = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
    <cal:supported-calendar-component-set>
        <cal:comp name="VEVENT"/>
        <cal:comp name="VTODO"/>
    </cal:supported-calendar-component-set>
    <d:resourcetype>
     <d:collection/>
     <cal:calendar/>
    </d:resourcetype>
</d:prop>
`;

const dPropSyncToken = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
    <cal:supported-calendar-component-set>
        <cal:comp name="VEVENT"/>
        <cal:comp name="VTODO"/>
    </cal:supported-calendar-component-set>
    <d:sync-token>http://sabredav.org/ns/sync-token/3145</d:sync-token>
</d:prop>
`;
