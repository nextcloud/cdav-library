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
 * You to.be have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import Parser from '../../src/parser.js';

describe('Parser', () => {

	it ('should allow to unregister any parser', () => {
		const parser = new Parser();

		expect(parser.canParse('{DAV:}displayname')).toEqual(true);
		parser.unregisterParser('{DAV:}displayname');
		expect(parser.canParse('{DAV:}displayname')).toEqual(false);
	});

	// RFC 4918 - HTTP Extensions for Web Distributed Authoring and Versioning (WebDAV)
	it('should properly handle {DAV:}displayname', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:displayname>Example collection</D:displayname>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}displayname')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('Example collection');
	});

	it('should properly handle {DAV:}creationdate', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:creationdate>1997-12-01T17:42:21-08:00</D:creationdate>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}creationdate')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('1997-12-01T17:42:21-08:00');
	});

	it('should properly handle {DAV:}getcontentlength', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:getcontentlength>4525</D:getcontentlength>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}getcontentlength')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(4525);
	});

	it('should properly handle {DAV:}getcontenttype', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:getcontenttype>text/html</D:getcontenttype>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}getcontenttype')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('text/html');
	});

	it('should properly handle {DAV:}getcontentlanguage', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:getcontentlanguage>en, en-US, en-cockney, i-cherokee, x-pig-latin</D:getcontentlanguage>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}getcontentlanguage')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('en, en-US, en-cockney, i-cherokee, x-pig-latin');
	});

	it('should properly handle {DAV:}getlastmodified', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:getlastmodified>Mon, 12 Jan 1998 09:25:56 GMT</D:getlastmodified>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}getlastmodified')).toEqual(true);
		expect(parser.parse(document, node, resolver).toISOString()).toEqual('1998-01-12T09:25:56.000Z');
	});

	it('should properly handle {DAV:}getetag', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:getetag>"zzyzx"</D:getetag>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}getetag')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('"zzyzx"');
	});

	it('should properly handle {DAV:}resourcetype', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:resourcetype>
					<D:collection/>
					<cal:calendar/>
				</D:resourcetype>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}resourcetype')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['{DAV:}collection', '{urn:ietf:params:xml:ns:caldav}calendar']);
	});

	// RFC 3744 - Web Distributed Authoring and Versioning (WebDAV) Access Control Protocol
	it('should properly handle {DAV:}inherited-acl-set', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:inherited-acl-set>
					<D:href>http://www.example.com/papers/</D:href>
				</D:inherited-acl-set>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}inherited-acl-set')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['http://www.example.com/papers/']);
	});

	it('should properly handle {DAV:}group', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:group>
					<D:href>http://www.example.com/acl/groups/foo</D:href>
				</D:group>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}group')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('http://www.example.com/acl/groups/foo');
	});

	it('should properly handle {DAV:}owner', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:owner>
					<D:href>http://www.example.com/acl/users/bla</D:href>
				</D:owner>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}owner')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('http://www.example.com/acl/users/bla');
	});

	it('should properly handle {DAV:}current-user-privilege-set', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:current-user-privilege-set>
					<D:privilege><D:read/></D:privilege>
					<D:privilege><D:read-acl/></D:privilege>
				</D:current-user-privilege-set>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}current-user-privilege-set')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['{DAV:}read', '{DAV:}read-acl']);
	});

	it('should properly handle {DAV:}principal-collection-set', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:principal-collection-set>
					<D:href>http://www.example.com/acl/users/</D:href>
					<D:href>http://www.example.com/acl/groups/</D:href>
				</D:principal-collection-set>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}principal-collection-set')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['http://www.example.com/acl/users/', 'http://www.example.com/acl/groups/']);
	});

	it('should properly handle {DAV:}principal-URL', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:principal-URL>
					<D:href>http://www.example.com/acl/users/bla</D:href>
				</D:principal-URL>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}principal-URL')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('http://www.example.com/acl/users/bla');
	});

	it('should properly handle {DAV:}alternate-URI-set', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:alternate-URI-set>
					<D:href>http://www.example.com/acl/users/</D:href>
					<D:href>http://www.example.com/acl/groups/</D:href>
				</D:alternate-URI-set>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}alternate-URI-set')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['http://www.example.com/acl/users/', 'http://www.example.com/acl/groups/']);
	});

	it('should properly handle {DAV:}group-member-set', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:group-member-set>
					<D:href>http://www.example.com/acl/users/</D:href>
					<D:href>http://www.example.com/acl/groups/</D:href>
				</D:group-member-set>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}group-member-set')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['http://www.example.com/acl/users/', 'http://www.example.com/acl/groups/']);
	});

	it('should properly handle {DAV:}group-membership', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:group-membership>
					<D:href>http://www.example.com/acl/users/</D:href>
					<D:href>http://www.example.com/acl/groups/</D:href>
				</D:group-membership>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}group-membership')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['http://www.example.com/acl/users/', 'http://www.example.com/acl/groups/']);
	});

	// RFC 5397 - WebDAV Current Principal Extension
	it('should properly handle {DAV:}current-user-principal - unauthenticated', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:current-user-principal>
					<D:unauthenticated/>
				</D:current-user-principal>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}current-user-principal')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual({
			type: 'unauthenticated',
			href: null
		});
	});

	it('should properly handle {DAV:}current-user-principal - href', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:current-user-principal>
					<D:href>/principals/users/foo</D:href>
				</D:current-user-principal>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}current-user-principal')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual({
			type: 'href',
			href: '/principals/users/foo'
		});
	});

	// RFC 6578 - Collection Synchronization for Web Distributed Authoring and Versioning (WebDAV)
	it('should properly handle {DAV:}sync-token', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<D:sync-token>http://example.com/ns/sync/1234</D:sync-token>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{DAV:}sync-token')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('http://example.com/ns/sync/1234');
	});

	// RFC 6352 - CardDAV: vCard Extensions to Web Distributed Authoring and Versioning (WebDAV)
	it('should properly handle {urn:ietf:params:xml:ns:carddav}addressbook-description', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:card="urn:ietf:params:xml:ns:carddav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<card:addressbook-description>Foo BAR</card:addressbook-description>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:carddav}addressbook-description')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('Foo BAR');
	});

	it('should properly handle {urn:ietf:params:xml:ns:carddav}supported-address-data', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:card="urn:ietf:params:xml:ns:carddav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<card:supported-address-data>
					<card:address-data-type content-type="text/vcard" version="3.0"/>
				</card:supported-address-data>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:carddav}supported-address-data')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual([{'content-type': 'text/vcard', 'version': '3.0'}]);
	});

	it('should properly handle {urn:ietf:params:xml:ns:carddav}foo', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:card="urn:ietf:params:xml:ns:carddav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<card:max-resource-size>104200</card:max-resource-size>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:carddav}max-resource-size')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(104200);
	});

	it('should properly handle {urn:ietf:params:xml:ns:carddav}addressbook-home-set', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:card="urn:ietf:params:xml:ns:carddav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<card:addressbook-home-set>
					<D:href>/addressbooks/admin/</D:href>
				</card:addressbook-home-set>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:carddav}addressbook-home-set')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['/addressbooks/admin/']);
	});

	it('should properly handle {urn:ietf:params:xml:ns:carddav}principal-address', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:card="urn:ietf:params:xml:ns:carddav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<card:principal-address>
					<D:href>/system/cyrus.vcf</D:href>
				</card:principal-address>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:carddav}principal-address')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('/system/cyrus.vcf');
	});

	it('should properly handle {urn:ietf:params:xml:ns:carddav}supported-collation-set', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:card="urn:ietf:params:xml:ns:carddav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<card:supported-collation-set>
        			<card:supported-collation>i;ascii-casemap</card:supported-collation>
        			<card:supported-collation>i;octet</card:supported-collation>
        			<card:supported-collation>i;unicode-casemap</card:supported-collation>
				</card:supported-collation-set>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:carddav}supported-collation-set')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['i;ascii-casemap', 'i;octet', 'i;unicode-casemap']);
	});

	// RFC 4791 - Calendaring Extensions to WebDAV (CalDAV)
	it('should properly handle {urn:ietf:params:xml:ns:caldav}calendar-home-set', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:calendar-home-set>
					<D:href>/calendars/admin/</D:href>
				</cal:calendar-home-set>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}calendar-home-set')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['/calendars/admin/']);
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}calendar-description', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:calendar-description>FOO BAR</cal:calendar-description>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}schedule-outbox-URL')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('FOO BAR');
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}calendar-timezone', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:calendar-timezone>BEGIN:VCALENDAR
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
END:VCALENDAR
</cal:calendar-timezone>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}calendar-timezone')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(`BEGIN:VCALENDAR
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
END:VCALENDAR
`);
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}supported-calendar-component-set', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:supported-calendar-component-set>
					<cal:comp name="VEVENT"/>
					<cal:comp name="VTODO"/>
				</cal:supported-calendar-component-set>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['VEVENT', 'VTODO']);
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}supported-calendar-data', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:supported-calendar-data>
					<cal:calendar-data content-type="text/calendar" version="2.0"/>
				</cal:supported-calendar-data>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}supported-calendar-data')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual([{'content-type': 'text/calendar', 'version': '2.0'}]);
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}max-resource-size', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:max-resource-size>102400</cal:max-resource-size>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}max-resource-size')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(102400);
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}min-date-time', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:min-date-time>19000101T000000Z</cal:min-date-time>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}min-date-time')).toEqual(true);
		expect(parser.parse(document, node, resolver).toISOString()).toEqual('1900-01-01T00:00:00.000Z');
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}max-date-time', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:max-date-time>20491231T235959Z</cal:max-date-time>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}max-date-time')).toEqual(true);
		expect(parser.parse(document, node, resolver).toISOString()).toEqual('2049-12-31T23:59:59.000Z');
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}max-instances', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:max-instances>42</cal:max-instances>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}max-instances')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(42);
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}max-attendees-per-instance', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:max-attendees-per-instance>10</cal:max-attendees-per-instance>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}max-attendees-per-instance')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(10);
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}supported-collation-set', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:supported-collation-set>
					<cal:supported-collation>i;ascii-casemap</cal:supported-collation>
					<cal:supported-collation>i;octet</cal:supported-collation>
				</cal:supported-collation-set>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}schedule-outbox-URL')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['i;ascii-casemap', 'i;octet']);
	});

	// RFC 6638 - Scheduling Extensions to CalDAV
	it('should properly handle {urn:ietf:params:xml:ns:caldav}schedule-outbox-URL', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:schedule-outbox-URL>
					<D:href>/calendars/admin/outbox</D:href>
				</cal:schedule-outbox-URL>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}schedule-outbox-URL')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('/calendars/admin/outbox');
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}schedule-inbox-URL', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:schedule-inbox-URL>
					<D:href>/calendars/admin/inbox</D:href>
				</cal:schedule-inbox-URL>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}schedule-inbox-URL')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('/calendars/admin/inbox');
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}calendar-user-address-set', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:calendar-user-address-set>
					<D:href>mailto:bernard@example.com</D:href>
					<D:href>mailto:bernard.desruisseaux@example.com</D:href>
				</cal:calendar-user-address-set>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}calendar-user-address-set')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['mailto:bernard@example.com', 'mailto:bernard.desruisseaux@example.com']);
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}calendar-user-type', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:calendar-user-type>INDIVIDUAL</cal:calendar-user-type>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}calendar-user-type')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('INDIVIDUAL');
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}schedule-calendar-transp - opaque', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:schedule-calendar-transp>
					<cal:opaque/>
				</cal:schedule-calendar-transp>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}schedule-calendar-transp')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('opaque');
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}schedule-calendar-transp - transparent', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:schedule-calendar-transp>
					<cal:transparent/>
				</cal:schedule-calendar-transp>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}schedule-calendar-transp')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('transparent');
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}schedule-default-calendar-URL', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:schedule-default-calendar-URL>
					<D:href>/home/cyrus/calendars/work/</D:href>
				</cal:schedule-default-calendar-URL>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}schedule-default-calendar-URL')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('/home/cyrus/calendars/work/');
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}schedule-tag', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:schedule-tag>"12345-67890"</cal:schedule-tag>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}schedule-tag')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('"12345-67890"');
	});

	// RFC 7809 - Calendaring Extensions to WebDAV (CalDAV): Time Zones by Reference
	it('should properly handle {urn:ietf:params:xml:ns:caldav}timezone-service-set', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:timezone-service-set>
					<D:href>https://timezones.example.com</D:href>
				</cal:timezone-service-set>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}timezone-service-set')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['https://timezones.example.com']);
	});


	it('should properly handle {urn:ietf:params:xml:ns:caldav}calendar-timezone-id', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:calendar-timezone-id>US-Eastern</cal:calendar-timezone-id>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}calendar-timezone-id')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('US-Eastern');
	});

	// RFC 7953 - Calendar Availability
	it('should properly handle {urn:ietf:params:xml:ns:caldav}calendar-availability', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:calendar-availability>BEGIN:VCALENDAR
CALSCALE:GREGORIAN
PRODID:-//example.com//iCalendar 2.0//EN
VERSION:2.0
BEGIN:VAVAILABILITY
UID:9BADC1F6-0FC4-44BF-AC3D-993BEC8C962A
DTSTAMP:20111005T133225Z
DTSTART;TZID=America/Montreal:20111002T000000
BEGIN:AVAILABLE
UID:6C9F69C3-BDA8-424E-B2CB-7012E796DDF7
SUMMARY:Monday to Friday from 9:00 to 18:00
DTSTART;TZID=America/Montreal:20111002T090000
DTEND;TZID=America/Montreal:20111002T180000
RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR
END:AVAILABLE
END:VAVAILABILITY
END:VCALENDAR
</cal:calendar-availability>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}calendar-availability')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(`BEGIN:VCALENDAR
CALSCALE:GREGORIAN
PRODID:-//example.com//iCalendar 2.0//EN
VERSION:2.0
BEGIN:VAVAILABILITY
UID:9BADC1F6-0FC4-44BF-AC3D-993BEC8C962A
DTSTAMP:20111005T133225Z
DTSTART;TZID=America/Montreal:20111002T000000
BEGIN:AVAILABLE
UID:6C9F69C3-BDA8-424E-B2CB-7012E796DDF7
SUMMARY:Monday to Friday from 9:00 to 18:00
DTSTART;TZID=America/Montreal:20111002T090000
DTEND;TZID=America/Montreal:20111002T180000
RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR
END:AVAILABLE
END:VAVAILABILITY
END:VCALENDAR
`);
	});

	// https://tools.ietf.org/html/draft-daboo-valarm-extensions-04#section-11.1
	it('should properly handle {http://apple.com/ns/ical/}calendar-order', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:aapl="http://apple.com/ns/ical/">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<aapl:calendar-order>4</aapl:calendar-order>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://apple.com/ns/ical/}calendar-order')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(4);
	});

	it('should properly handle {http://apple.com/ns/ical/}calendar-color', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:aapl="http://apple.com/ns/ical/">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<aapl:calendar-color>#AABBCC</aapl:calendar-color>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://apple.com/ns/ical/}calendar-color')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('#AABBCC');
	});

	it('should properly handle {http://apple.com/ns/ical/}calendar-color - RGBA', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:aapl="http://apple.com/ns/ical/">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<aapl:calendar-color>#AABBCCEE</aapl:calendar-color>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://apple.com/ns/ical/}calendar-color')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('#AABBCC');
	});

	it('should properly handle {http://calendarserver.org/ns/}source', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cs="http://calendarserver.org/ns/">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cs:source>
					<D:href>webcal://www.webcal.fi/cal.php?id=49&amp;rid=ics&amp;wrn=0&amp;wp=12&amp;wf=55</D:href>
				</cs:source>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://calendarserver.org/ns/}source')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('webcal://www.webcal.fi/cal.php?id=49&rid=ics&wrn=0&wp=12&wf=55');
	});

	// https://tools.ietf.org/html/draft-daboo-valarm-extensions-04#section-11.1
	it('should properly handle {urn:ietf:params:xml:ns:caldav}default-alarm-vevent-datetime', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:default-alarm-vevent-datetime>BEGIN:VALARM
UID:77D80D14-906B-4257-963F-85B1E734DBB6
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
ACTION:DISPLAY
PROXIMITY:DEPART
STRUCTURE-LOCATION;VALUE=URI:geo:40.443,-79.945;u=10
DESCRIPTION:Remember to buy milk
END:VALARM</cal:default-alarm-vevent-datetime>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}default-alarm-vevent-datetime')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(`BEGIN:VALARM
UID:77D80D14-906B-4257-963F-85B1E734DBB6
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
ACTION:DISPLAY
PROXIMITY:DEPART
STRUCTURE-LOCATION;VALUE=URI:geo:40.443,-79.945;u=10
DESCRIPTION:Remember to buy milk
END:VALARM`);
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}default-alarm-vevent-date', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:default-alarm-vevent-date>BEGIN:VALARM
UID:77D80D14-906B-4257-963F-85B1E734DBB6
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
ACTION:DISPLAY
PROXIMITY:DEPART
STRUCTURE-LOCATION;VALUE=URI:geo:40.443,-79.945;u=10
DESCRIPTION:Remember to buy milk
END:VALARM</cal:default-alarm-vevent-date>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}default-alarm-vevent-date')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(`BEGIN:VALARM
UID:77D80D14-906B-4257-963F-85B1E734DBB6
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
ACTION:DISPLAY
PROXIMITY:DEPART
STRUCTURE-LOCATION;VALUE=URI:geo:40.443,-79.945;u=10
DESCRIPTION:Remember to buy milk
END:VALARM`);
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}default-alarm-vtodo-datetime', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:default-alarm-vtodo-datetime>BEGIN:VALARM
UID:77D80D14-906B-4257-963F-85B1E734DBB6
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
ACTION:DISPLAY
PROXIMITY:DEPART
STRUCTURE-LOCATION;VALUE=URI:geo:40.443,-79.945;u=10
DESCRIPTION:Remember to buy milk
END:VALARM</cal:default-alarm-vtodo-datetime>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}default-alarm-vtodo-datetime')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(`BEGIN:VALARM
UID:77D80D14-906B-4257-963F-85B1E734DBB6
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
ACTION:DISPLAY
PROXIMITY:DEPART
STRUCTURE-LOCATION;VALUE=URI:geo:40.443,-79.945;u=10
DESCRIPTION:Remember to buy milk
END:VALARM`);
	});

	it('should properly handle {urn:ietf:params:xml:ns:caldav}default-alarm-vtodo-date', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cal="urn:ietf:params:xml:ns:caldav">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cal:default-alarm-vtodo-date>BEGIN:VALARM
UID:77D80D14-906B-4257-963F-85B1E734DBB6
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
ACTION:DISPLAY
PROXIMITY:DEPART
STRUCTURE-LOCATION;VALUE=URI:geo:40.443,-79.945;u=10
DESCRIPTION:Remember to buy milk
END:VALARM</cal:default-alarm-vtodo-date>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{urn:ietf:params:xml:ns:caldav}default-alarm-vtodo-date')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(`BEGIN:VALARM
UID:77D80D14-906B-4257-963F-85B1E734DBB6
TRIGGER;VALUE=DATE-TIME:19760401T005545Z
ACTION:DISPLAY
PROXIMITY:DEPART
STRUCTURE-LOCATION;VALUE=URI:geo:40.443,-79.945;u=10
DESCRIPTION:Remember to buy milk
END:VALARM`);
	});


	// https://github.com/apple/ccs-calendarserver/blob/master/doc/Extensions/caldav-ctag.txt
	it('should properly handle {http://calendarserver.org/ns/}getctag', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cs="http://calendarserver.org/ns/">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cs:getctag>ABCD-GUID-IN-THIS-COLLECTION-20070228T122324010340</cs:getctag>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://calendarserver.org/ns/}getctag')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('ABCD-GUID-IN-THIS-COLLECTION-20070228T122324010340');
	});

	// https://github.com/apple/ccs-calendarserver/blob/master/doc/Extensions/caldav-proxy.txt
	it('should properly handle {http://calendarserver.org/ns/}calendar-proxy-read-for', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cs="http://calendarserver.org/ns/">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cs:calendar-proxy-read-for>
					<D:href>/principals/foo/bar</D:href>
					<D:href>/principals/bar/foo</D:href>
				</cs:calendar-proxy-read-for>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://calendarserver.org/ns/}calendar-proxy-read-for')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['/principals/foo/bar', '/principals/bar/foo']);
	});

	it('should properly handle {http://calendarserver.org/ns/}calendar-proxy-write-for', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cs="http://calendarserver.org/ns/">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cs:calendar-proxy-write-for>
					<D:href>/principals/foo/bar</D:href>
					<D:href>/principals/bar/foo</D:href>
				</cs:calendar-proxy-write-for>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://calendarserver.org/ns/}calendar-proxy-write-for')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['/principals/foo/bar', '/principals/bar/foo']);
	});




	// https://github.com/apple/ccs-calendarserver/blob/master/doc/Extensions/caldav-sharing.txt
	it('should properly handle {http://calendarserver.org/ns/}allowed-sharing-modes', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cs="http://calendarserver.org/ns/">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cs:allowed-sharing-modes>
					<cs:can-be-shared/>
					<cs:can-be-published/>
				</cs:allowed-sharing-modes>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://calendarserver.org/ns/}allowed-sharing-modes')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(['{http://calendarserver.org/ns/}can-be-shared', '{http://calendarserver.org/ns/}can-be-published']);
	});

	it('should properly handle {http://calendarserver.org/ns/}shared-url', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cs="http://calendarserver.org/ns/">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cs:shared-url>
					<D:href>calendars/owner/original</D:href>
				</cs:shared-url>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://calendarserver.org/ns/}shared-url')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('calendars/owner/original');
	});

	it('should properly handle {http://sabredav.org/ns}owner-principal', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:sd="http://sabredav.org/ns">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<sd:owner-principal>
					<D:href>principals/owner</D:href>
				</sd:owner-principal>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://sabredav.org/ns}owner-principal')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('principals/owner');
	});

	it('should properly handle {http://sabredav.org/ns}read-only - enabled', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:sd="http://sabredav.org/ns">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<sd:read-only>1</sd:read-only>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://sabredav.org/ns}read-only')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(true);
	});

	it('should properly handle {http://sabredav.org/ns}read-only - disabled', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:sd="http://sabredav.org/ns">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<sd:read-only>0</sd:read-only>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://sabredav.org/ns}read-only')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(false);
	});

	it('should properly handle {http://calendarserver.org/ns/}pre-publish-url', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cs="http://calendarserver.org/ns/">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cs:pre-publish-url>
					<D:href>http://nextcloud.dev/remote.php/dav/public-calendars/LI2J0V4TRZP6GDAK</D:href>
				</cs:pre-publish-url>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://calendarserver.org/ns/}pre-publish-url')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('http://nextcloud.dev/remote.php/dav/public-calendars/LI2J0V4TRZP6GDAK');
	});

	it('should properly handle {http://calendarserver.org/ns/}publish-url', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:cs="http://calendarserver.org/ns/">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<cs:publish-url>
					<D:href>http://nextcloud.dev/remote.php/dav/public-calendars/LI2J0V4TRZP6GDAK</D:href>
				</cs:publish-url>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://calendarserver.org/ns/}publish-url')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('http://nextcloud.dev/remote.php/dav/public-calendars/LI2J0V4TRZP6GDAK');
	});

	it('should properly handle {http://owncloud.org/ns}invite', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:oc="http://owncloud.org/ns">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<oc:invite>
					<oc:user>
						<D:href>principal:principals/users/admin</D:href>
						<oc:common-name>John Doe</oc:common-name>
						<oc:invite-accepted/>
						<oc:access>
							<oc:read-write/>
						</oc:access>
					</oc:user>
				</oc:invite>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://owncloud.org/ns}invite')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual([{
			href: 'principal:principals/users/admin',
			'common-name': 'John Doe',
			'invite-accepted': true,
			access: ['{http://owncloud.org/ns}read-write']
		}]);
	});

	// Nextcloud specific
	it('should properly handle {http://owncloud.org/ns}calendar-enabled - enabled', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:oc="http://owncloud.org/ns">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
    			<oc:calendar-enabled>1</oc:calendar-enabled>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://owncloud.org/ns}calendar-enabled')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(true);
	});

	it('should properly handle {http://owncloud.org/ns}calendar-enabled - disabled', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:oc="http://owncloud.org/ns">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
    			<oc:calendar-enabled>0</oc:calendar-enabled>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://owncloud.org/ns}calendar-enabled')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(false);
	});

	it('should properly handle {http://owncloud.org/ns}enabled - enabled', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:oc="http://owncloud.org/ns">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
    			<oc:enabled>1</oc:enabled>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://owncloud.org/ns}enabled')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(true);
	});

	it('should properly handle {http://owncloud.org/ns}enabled - disabled', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:oc="http://owncloud.org/ns">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
    			<oc:enabled>0</oc:enabled>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://owncloud.org/ns}enabled')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(false);
	});

	it('should properly handle {http://owncloud.org/ns}read-only - enabled', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:oc="http://owncloud.org/ns">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
    			<oc:read-only>1</oc:read-only>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://owncloud.org/ns}read-only')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(true);
	});

	it('should properly handle {http://owncloud.org/ns}read-only - disabled', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:oc="http://owncloud.org/ns">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
    			<oc:read-only>0</oc:read-only>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://owncloud.org/ns}read-only')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual(false);
	});

	it('should properly handle {http://nextcloud.com/ns}owner-displayname', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:nc="http://nextcloud.com/ns">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<nc:owner-displayname>Administrator</nc:owner-displayname>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://nextcloud.com/ns}owner-displayname')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('Administrator');
	});

	it('should properly handle {http://sabredav.org/ns}email-address', () => {
		const parser = new Parser();

		const xml = `<?xml version="1.0" encoding="utf-8" ?>
<D:multistatus xmlns:D="DAV:" xmlns:s="http://sabredav.org/ns">
	<D:response>
		<D:href>/foo</D:href>
		<D:propstat>
			<D:prop>
				<s:email-address>foo@bar.com</s:email-address>
			</D:prop>
			<D:status>HTTP/1.1 200 OK</D:status>
		</D:propstat>
	</D:response>
</D:multistatus>`;

		const [document, node, resolver] = getDocumentNodeResolverFromXML(xml);

		expect(parser.canParse('{http://sabredav.org/ns}email-address')).toEqual(true);
		expect(parser.parse(document, node, resolver)).toEqual('foo@bar.com');
	});
});

function getDocumentNodeResolverFromXML(xml) {
	function resolver(short) {
		const NS_MAP = {
			d: 'DAV:',
			cl: 'urn:ietf:params:xml:ns:caldav',
			cr: 'urn:ietf:params:xml:ns:carddav',
			oc: 'http://owncloud.org/ns',
			nc: 'http://nextcloud.com/ns',
			aapl: 'http://apple.com/ns/ical/',
			cs: 'http://calendarserver.org/ns/',
			sd: 'http://sabredav.org/ns'
		};

		return NS_MAP[short];
	}

	const domParser = new DOMParser();
	const document = domParser.parseFromString(xml, 'application/xml');

	const responses = document.evaluate('/d:multistatus/d:response', document, resolver, XPathResult.ANY_TYPE, null);
	const response = responses.iterateNext();
	const propStats = document.evaluate('d:propstat', response, resolver, XPathResult.ANY_TYPE, null);
	const propStat = propStats.iterateNext();
	const props = document.evaluate('d:prop/*', propStat, resolver, XPathResult.ANY_TYPE, null);

	return [document, props.iterateNext(), resolver];
}
