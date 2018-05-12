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

import davCollectionShareableParser from "../../../src/parser/davCollectionShareableParser.js";

describe('Shareable Dav collection Parser', () => {
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
		const props = parseProps(dPropNoShare, davService);

		const result = davCollectionShareableParser(props);
		expect(result).toEqual({});
	});

	it('should parse {http://owncloud.org/ns}invite correctly - rw', () => {
		const props = parseProps(dPropInviteRW, davService);

		const result = davCollectionShareableParser(props);
		expect(result).toEqual({'{http://owncloud.org/ns}invite': [{
				href: 'principal:principals/users/admin',
				displayName: 'John Doe',
				writable: true
			}]});
	});

	it('should parse {http://owncloud.org/ns}invite correctly - ro', () => {
		const props = parseProps(dPropInviteRO, davService);

		const result = davCollectionShareableParser(props);
		expect(result).toEqual({'{http://owncloud.org/ns}invite': [{
				href: 'principal:principals/users/admin',
				displayName: 'John Doe',
				writable: false
			}]});
	});

	it('should parse {http://calendarserver.org/ns/}allowed-sharing-modes correctly', () => {
		const props = parseProps(dPropAllowedSharing, davService);

		const result = davCollectionShareableParser(props);
		expect(result).toEqual({'{http://calendarserver.org/ns/}allowed-sharing-modes': ['{http://calendarserver.org/ns/}can-be-shared', '{http://calendarserver.org/ns/}can-be-published']});
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

const dPropNoShare = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
</d:prop>
`;

const dPropInviteRW = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
    <oc:invite>
     <oc:user>
      <d:href>principal:principals/users/admin</d:href>
      <oc:common-name>John Doe</oc:common-name>
      <oc:invite-accepted/>
      <oc:access>
       <oc:read-write/>
      </oc:access>
     </oc:user>
    </oc:invite>
</d:prop>
`;

const dPropInviteRO = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
    <oc:invite>
     <oc:user>
      <d:href>principal:principals/users/admin</d:href>
      <oc:common-name>John Doe</oc:common-name>
      <oc:invite-accepted/>
      <oc:access>
       <oc:read/>
      </oc:access>
     </oc:user>
    </oc:invite>
</d:prop>
`;

const dPropAllowedSharing = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
	<cs:allowed-sharing-modes>
        <cs:can-be-shared/>
        <cs:can-be-published/>
    </cs:allowed-sharing-modes>
</d:prop>
`;
