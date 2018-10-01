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

import davCollectionPublishableParser from "../../../src/parser/davCollectionPublishableParser.js";

describe('Publishable Dav collection Parser', () => {
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
		const props = parseProps(dPropNoPubProp, davService);

		const result = davCollectionPublishableParser(props);
		expect(result).toEqual({});
	});

	it('should parse {http://calendarserver.org/ns/}publish-url correctly', () => {
		const props = parseProps(dPropPublishURL, davService);

		const result = davCollectionPublishableParser(props);
		expect(result).toEqual({'{http://calendarserver.org/ns/}publish-url': 'http://nextcloud.dev/remote.php/dav/public-calendars/LI2J0V4TRZP6GDAK'});
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

const dPropNoPubProp = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
</d:prop>
`;

const dPropPublishURL = `<?xml version="1.0"?>
<d:prop xmlns:d="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav" xmlns:cs="http://calendarserver.org/ns/" xmlns:oc="http://owncloud.org/ns">
	<d:displayname>Privat</d:displayname>
    <cs:publish-url>
		<d:href>http://nextcloud.dev/remote.php/dav/public-calendars/LI2J0V4TRZP6GDAK</d:href>
	</cs:publish-url>
</d:prop>
`;
