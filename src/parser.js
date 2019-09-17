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

/**
 *
 */
export default class Parser {

	/**
	 *
	 */
	constructor() {
		/**
		 * Key Value Map of propertyName => parser
		 * @type {Object}
		 * @private
		 */
		this._parser = {};

		// initialize default parsers shipped with this lib
		this._registerDefaultParsers();
	}

	/**
	 * checks if a parser exists for a given property name
	 *
	 * @param {String} propertyName
	 * @returns {boolean}
	 */
	canParse(propertyName) {
		return Object.prototype.hasOwnProperty.call(this._parser, propertyName);
	}

	/**
	 * parses a single prop Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @return {*}
	 */
	parse(document, node, resolver) {
		const propertyName = `{${node.namespaceURI}}${node.localName}`;
		if (!this.canParse(propertyName)) {
			throw new Error(`Unable to parse unknown property "${propertyName}"`);
		}

		return this._parser[propertyName](document, node, resolver);
	}

	/**
	 * registers a parser for propertyName
	 *
	 * @param {String} propertyName
	 * @param {Function} parser
	 */
	registerParser(propertyName, parser) {
		this._parser[propertyName] = parser;
	}

	/**
	 * unregisters a parser for propertyName
	 *
	 * @param {String} propertyName
	 */
	unregisterParser(propertyName) {
		delete this._parser[propertyName];
	}

	/**
	 * registers the predefined parsers
	 *
	 * @private
	 */
	_registerDefaultParsers() {
		// RFC 4918 - HTTP Extensions for Web Distributed Authoring and Versioning (WebDAV)
		this.registerParser('{DAV:}displayname', Parser.text);
		this.registerParser('{DAV:}creationdate', Parser.text);
		this.registerParser('{DAV:}getcontentlength', Parser.decInt);
		this.registerParser('{DAV:}getcontenttype', Parser.text);
		this.registerParser('{DAV:}getcontentlanguage', Parser.text);
		this.registerParser('{DAV:}getlastmodified', Parser.rfc1123Date);
		this.registerParser('{DAV:}getetag', Parser.text);
		this.registerParser('{DAV:}resourcetype', Parser.resourceType);

		// RFC 3744 - Web Distributed Authoring and Versioning (WebDAV) Access Control Protocol
		this.registerParser('{DAV:}inherited-acl-set', Parser.hrefs);
		this.registerParser('{DAV:}group', Parser.href);
		this.registerParser('{DAV:}owner', Parser.href);
		this.registerParser('{DAV:}current-user-privilege-set', Parser.privileges);
		this.registerParser('{DAV:}principal-collection-set', Parser.hrefs);
		this.registerParser('{DAV:}principal-URL', Parser.href);
		this.registerParser('{DAV:}alternate-URI-set', Parser.hrefs);
		this.registerParser('{DAV:}group-member-set', Parser.hrefs);
		this.registerParser('{DAV:}group-membership', Parser.hrefs);

		// RFC 5397 - WebDAV Current Principal Extension
		this.registerParser('{DAV:}current-user-principal', Parser.currentUserPrincipal);

		// RFC 6578 - Collection Synchronization for Web Distributed Authoring and Versioning (WebDAV)
		this.registerParser('{DAV:}sync-token', Parser.text);

		// RFC 6352 - CardDAV: vCard Extensions to Web Distributed Authoring and Versioning (WebDAV)
		this.registerParser('{urn:ietf:params:xml:ns:carddav}address-data', Parser.text);
		this.registerParser('{urn:ietf:params:xml:ns:carddav}addressbook-description', Parser.text);
		this.registerParser('{urn:ietf:params:xml:ns:carddav}supported-address-data', Parser.addressDataTypes);
		this.registerParser('{urn:ietf:params:xml:ns:carddav}max-resource-size', Parser.decInt);
		this.registerParser('{urn:ietf:params:xml:ns:carddav}addressbook-home-set', Parser.hrefs);
		this.registerParser('{urn:ietf:params:xml:ns:carddav}principal-address', Parser.href);
		this.registerParser('{urn:ietf:params:xml:ns:carddav}supported-collation-set', Parser.supportedCardDAVCollations);

		// RFC 4791 - Calendaring Extensions to WebDAV (CalDAV)
		this.registerParser('{urn:ietf:params:xml:ns:caldav}calendar-data', Parser.text);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}calendar-home-set', Parser.hrefs);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}calendar-description', Parser.text);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}calendar-timezone', Parser.text);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}supported-calendar-component-set', Parser.calendarComps);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}supported-calendar-data', Parser.calendarDatas);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}max-resource-size', Parser.decInt);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}min-date-time', Parser.iCalendarTimestamp);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}max-date-time', Parser.iCalendarTimestamp);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}max-instances', Parser.decInt);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}max-attendees-per-instance', Parser.decInt);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}supported-collation-set', Parser.supportedCalDAVCollations);

		// RFC 6638 - Scheduling Extensions to CalDAV
		this.registerParser('{urn:ietf:params:xml:ns:caldav}schedule-outbox-URL', Parser.href);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}schedule-inbox-URL', Parser.href);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}calendar-user-address-set', Parser.hrefs);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}calendar-user-type', Parser.text);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}schedule-calendar-transp', Parser.scheduleCalendarTransp);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}schedule-default-calendar-URL', Parser.href);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}schedule-tag', Parser.text);

		// RFC 7809 - Calendaring Extensions to WebDAV (CalDAV): Time Zones by Reference
		this.registerParser('{urn:ietf:params:xml:ns:caldav}timezone-service-set', Parser.hrefs);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}calendar-timezone-id', Parser.text);

		// RFC 7953 - Calendar Availability
		this.registerParser('{urn:ietf:params:xml:ns:caldav}calendar-availability', Parser.text);

		// Apple
		this.registerParser('{http://apple.com/ns/ical/}calendar-order', Parser.decInt);
		this.registerParser('{http://apple.com/ns/ical/}calendar-color', Parser.color);
		this.registerParser('{http://calendarserver.org/ns/}source', Parser.href);

		// https://tools.ietf.org/html/draft-daboo-valarm-extensions-04#section-11.1
		this.registerParser('{urn:ietf:params:xml:ns:caldav}default-alarm-vevent-datetime', Parser.text);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}default-alarm-vevent-date', Parser.text);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}default-alarm-vtodo-datetime', Parser.text);
		this.registerParser('{urn:ietf:params:xml:ns:caldav}default-alarm-vtodo-date', Parser.text);

		// https://github.com/apple/ccs-calendarserver/blob/master/doc/Extensions/caldav-ctag.txt
		this.registerParser('{http://calendarserver.org/ns/}getctag', Parser.text);

		// https://github.com/apple/ccs-calendarserver/blob/master/doc/Extensions/caldav-proxy.txt
		this.registerParser('{http://calendarserver.org/ns/}calendar-proxy-read-for', Parser.hrefs);
		this.registerParser('{http://calendarserver.org/ns/}calendar-proxy-write-for', Parser.hrefs);

		// https://github.com/apple/ccs-calendarserver/blob/master/doc/Extensions/caldav-sharing.txt
		this.registerParser('{http://calendarserver.org/ns/}allowed-sharing-modes', Parser.allowedSharingModes);
		this.registerParser('{http://calendarserver.org/ns/}shared-url', Parser.href);
		this.registerParser('{http://sabredav.org/ns}owner-principal', Parser.href);
		this.registerParser('{http://sabredav.org/ns}read-only', Parser.bool);
		this.registerParser('{http://calendarserver.org/ns/}pre-publish-url', Parser.href);
		this.registerParser('{http://calendarserver.org/ns/}publish-url', Parser.href);

		// Nextcloud custom sharing
		this.registerParser('{http://owncloud.org/ns}invite', Parser.ocInvite);

		// Nextcloud specific
		this.registerParser('{http://owncloud.org/ns}calendar-enabled', Parser.bool);
		this.registerParser('{http://owncloud.org/ns}enabled', Parser.bool);
		this.registerParser('{http://owncloud.org/ns}read-only', Parser.bool);
		this.registerParser('{http://nextcloud.com/ns}owner-displayname', Parser.text);
		this.registerParser('{http://nextcloud.com/ns}has-photo', Parser.bool);

		// Sabre/Dav specific
		this.registerParser('{http://sabredav.org/ns}email-address', Parser.text);
	}

	/**
	 * returns text value of Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {String}
	 */
	static text(document, node, resolver) {
		return document.evaluate('string(.)', node, resolver, XPathResult.ANY_TYPE, null).stringValue;
	}

	/**
	 * returns boolean value of Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {Boolean}
	 */
	static bool(document, node, resolver) {
		return Parser.text(document, node, resolver) === '1';
	}

	/**
	 * returns decimal integer value of Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {Number}
	 */
	static decInt(document, node, resolver) {
		return parseInt(Parser.text(document, node, resolver), 10);
	}

	/**
	 * returns Date value of Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {Date}
	 */
	static rfc1123Date(document, node, resolver) {
		const text = Parser.text(document, node, resolver);

		// TODO this might not work in every browser
		return new Date(text);
	}

	/**
	 * returns Date value of Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {Date}
	 */
	static iCalendarTimestamp(document, node, resolver) {
		const text = Parser.text(document, node, resolver);

		const year = parseInt(text.substr(0, 4), 10);
		const month = parseInt(text.substr(4, 2), 10) - 1;
		const date = parseInt(text.substr(6, 2), 10);

		const hour = parseInt(text.substr(9, 2), 10);
		const minute = parseInt(text.substr(11, 2), 10);
		const second = parseInt(text.substr(13, 2), 10);

		const dateObj = new Date();
		dateObj.setUTCFullYear(year, month, date);
		dateObj.setUTCHours(hour, minute, second, 0);
		return dateObj;
	}

	/**
	 * parses a {DAV:}resourcetype Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {String[]}
	 */
	static resourceType(document, node, resolver) {
		const result = [];
		const children = document.evaluate('*', node, resolver, XPathResult.ANY_TYPE, null);
		let childNode;

		while ((childNode = children.iterateNext()) !== null) {
			const ns = document.evaluate('namespace-uri(.)', childNode, resolver, XPathResult.ANY_TYPE, null).stringValue;
			const local = document.evaluate('local-name(.)', childNode, resolver, XPathResult.ANY_TYPE, null).stringValue;

			result.push(`{${ns}}${local}`);
		}

		return result;
	}

	/**
	 * parses a node with one href nodes as child
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {String}
	 */
	static href(document, node, resolver) {
		return document.evaluate('string(d:href)', node, resolver, XPathResult.ANY_TYPE, null).stringValue;
	}

	/**
	 * parses a node with multiple href nodes as children
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {String[]}
	 */
	static hrefs(document, node, resolver) {
		const result = [];
		const hrefs = document.evaluate('d:href', node, resolver, XPathResult.ANY_TYPE, null);
		let hrefNode;

		while ((hrefNode = hrefs.iterateNext()) !== null) {
			result.push(document.evaluate('string(.)', hrefNode, resolver, XPathResult.ANY_TYPE, null).stringValue);
		}

		return result;
	}

	/**
	 * Parses a set of {DAV:}privilege Nodes
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {String[]}
	 */
	static privileges(document, node, resolver) {
		const result = [];
		const privileges = document.evaluate('d:privilege/*', node, resolver, XPathResult.ANY_TYPE, null);
		let privilegeNode;

		while ((privilegeNode = privileges.iterateNext()) !== null) {
			const ns = document.evaluate('namespace-uri(.)', privilegeNode, resolver, XPathResult.ANY_TYPE, null).stringValue;
			const local = document.evaluate('local-name(.)', privilegeNode, resolver, XPathResult.ANY_TYPE, null).stringValue;

			result.push(`{${ns}}${local}`);
		}

		return result;
	}

	/**
	 * parses the {DAV:}current-user-principal Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {Object}
	 * @property {String} type
	 * @property {String} href
	 */
	static currentUserPrincipal(document, node, resolver) {
		const unauthenticatedCount
			= document.evaluate('count(d:unauthenticated)', node, resolver, XPathResult.ANY_TYPE, null).numberValue;

		if (unauthenticatedCount !== 0) {
			return {
				type: 'unauthenticated',
				href: null
			};
		} else {
			return {
				type: 'href',
				href: Parser.href(...arguments)
			};
		}
	}

	/**
	 * Parses a {urn:ietf:params:xml:ns:carddav}supported-address-data Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {*}
	 */
	static addressDataTypes(document, node, resolver) {
		const result = [];
		const addressDatas = document.evaluate('cr:address-data-type', node, resolver, XPathResult.ANY_TYPE, null);
		let addressDataNode;

		while ((addressDataNode = addressDatas.iterateNext()) !== null) {
			result.push({
				'content-type': document.evaluate('string(@content-type)', addressDataNode, resolver, XPathResult.ANY_TYPE, null).stringValue,
				version: document.evaluate('string(@version)', addressDataNode, resolver, XPathResult.ANY_TYPE, null).stringValue
			});
		}

		return result;
	}

	/**
	 * Parses a {urn:ietf:params:xml:ns:carddav}supported-collation-set Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {*}
	 */
	static supportedCardDAVCollations(document, node, resolver) {
		const result = [];
		const collations = document.evaluate('cr:supported-collation', node, resolver, XPathResult.ANY_TYPE, null);
		let collationNode;

		while ((collationNode = collations.iterateNext()) !== null) {
			result.push(document.evaluate('string(.)', collationNode, resolver, XPathResult.ANY_TYPE, null).stringValue);
		}

		return result;
	}

	/**
	 * Parses a {urn:ietf:params:xml:ns:caldav}supported-collation-set Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {*}
	 */
	static supportedCalDAVCollations(document, node, resolver) {
		const result = [];
		const collations = document.evaluate('cl:supported-collation', node, resolver, XPathResult.ANY_TYPE, null);
		let collationNode;

		while ((collationNode = collations.iterateNext()) !== null) {
			result.push(document.evaluate('string(.)', collationNode, resolver, XPathResult.ANY_TYPE, null).stringValue);
		}

		return result;
	}

	/**
	 * Parses a {urn:ietf:params:xml:ns:caldav}supported-calendar-component-set Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {String[]}
	 */
	static calendarComps(document, node, resolver) {
		const result = [];
		const comps = document.evaluate('cl:comp', node, resolver, XPathResult.ANY_TYPE, null);
		let compNode;

		while ((compNode = comps.iterateNext()) !== null) {
			result.push(document.evaluate('string(@name)', compNode, resolver, XPathResult.ANY_TYPE, null).stringValue);
		}

		return result;
	}

	/**
	 * Parses a {urn:ietf:params:xml:ns:caldav}supported-calendar-data Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {*}
	 */
	static calendarDatas(document, node, resolver) {
		const result = [];
		const calendarDatas = document.evaluate('cl:calendar-data', node, resolver, XPathResult.ANY_TYPE, null);
		let calendarDataNode;

		while ((calendarDataNode = calendarDatas.iterateNext()) !== null) {
			result.push({
				'content-type': document.evaluate('string(@content-type)', calendarDataNode, resolver, XPathResult.ANY_TYPE, null).stringValue,
				version: document.evaluate('string(@version)', calendarDataNode, resolver, XPathResult.ANY_TYPE, null).stringValue
			});
		}

		return result;
	}

	/**
	 * Parses a {urn:ietf:params:xml:ns:caldav}schedule-calendar-transp Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {String}
	 */
	static scheduleCalendarTransp(document, node, resolver) {
		const children = document.evaluate('cl:opaque | cl:transparent', node, resolver, XPathResult.ANY_TYPE, null);
		const childNode = children.iterateNext();
		if (childNode) {
			return document.evaluate('local-name(.)', childNode, resolver, XPathResult.ANY_TYPE, null).stringValue;
		}
	}

	/**
	 * Parses a {http://apple.com/ns/ical/}calendar-color Node
	 * strips the alpha value of RGB values
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {String}
	 */
	static color(document, node, resolver) {
		const text = Parser.text(document, node, resolver);
		// some stupid clients store an alpha value in the rgb hash (like #rrggbbaa) *cough cough* Apple Calendar *cough cough*
		// but some browsers can't parse that *cough cough* Safari 9 *cough cough*
		// Safari 10 seems to support this though
		if (text.length === 9) {
			return text.substr(0, 7);
		}

		return text;
	}

	/**
	 * Parses a {http://calendarserver.org/ns/}allowed-sharing-modes Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {String[]}
	 */
	static allowedSharingModes(document, node, resolver) {
		const result = [];
		const children = document.evaluate('cs:can-be-shared | cs:can-be-published', node, resolver, XPathResult.ANY_TYPE, null);
		let childNode;

		while ((childNode = children.iterateNext()) !== null) {
			const ns = document.evaluate('namespace-uri(.)', childNode, resolver, XPathResult.ANY_TYPE, null).stringValue;
			const local = document.evaluate('local-name(.)', childNode, resolver, XPathResult.ANY_TYPE, null).stringValue;

			result.push(`{${ns}}${local}`);
		}

		return result;
	}

	/**
	 * Parses a {http://owncloud.org/ns}invite Node
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {*}
	 */
	static ocInvite(document, node, resolver) {
		const result = [];
		const users = document.evaluate('oc:user', node, resolver, XPathResult.ANY_TYPE, null);
		let userNode;

		while ((userNode = users.iterateNext()) !== null) {
			result.push({
				href: Parser.href(document, userNode, resolver),
				'common-name': document.evaluate('string(oc:common-name)', userNode, resolver, XPathResult.ANY_TYPE, null).stringValue,
				'invite-accepted': document.evaluate('count(oc:invite-accepted)', userNode, resolver, XPathResult.ANY_TYPE, null).numberValue === 1,
				access: Parser.ocAccess(document, userNode, resolver)
			});
		}

		return result;
	}

	/**
	 * Parses a set of {http://owncloud.org/ns}access Nodes
	 *
	 * @param {Document} document
	 * @param {Node} node
	 * @param {XPathNSResolver} resolver
	 * @returns {String[]}
	 */
	static ocAccess(document, node, resolver) {
		const result = [];
		const privileges = document.evaluate('oc:access/*', node, resolver, XPathResult.ANY_TYPE, null);
		let privilegeNode;

		while ((privilegeNode = privileges.iterateNext()) !== null) {
			const ns = document.evaluate('namespace-uri(.)', privilegeNode, resolver, XPathResult.ANY_TYPE, null).stringValue;
			const local = document.evaluate('local-name(.)', privilegeNode, resolver, XPathResult.ANY_TYPE, null).stringValue;

			result.push(`{${ns}}${local}`);
		}

		return result;
	}

}
