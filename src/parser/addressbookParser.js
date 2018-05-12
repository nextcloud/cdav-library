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

import * as NS from "../utility/namespaceUtility.js";

/**
 *
 * This parser is capable of parsing:
 * - {urn:ietf:params:xml:ns:carddav}addressbook-description
 * - {urn:ietf:params:xml:ns:carddav}supported-address-data
 * - {urn:ietf:params:xml:ns:carddav}max-resource-size
 * - {http://calendarserver.org/ns/}getctag
 * - {http://owncloud.org/ns}enabled
 * - {http://owncloud.org/ns}read-only
 *
 * @param {Object} props
 * @return {Object}
 */
export default function addressBookParser(props) {
	const parsed = {};

	Object.entries(props).forEach(([key, value]) => {
		switch (key) {
			case '{urn:ietf:params:xml:ns:carddav}addressbook-description':
			case '{http://calendarserver.org/ns/}getctag':
				parsed[key] = text(value);
				break;
			case '{urn:ietf:params:xml:ns:carddav}max-resource-size':
				parsed[key] = int(value);
				break;

			case '{http://owncloud.org/ns}enabled':
			case '{http://owncloud.org/ns}read-only':
				parsed[key] = bool(value);
				break;

			case '{urn:ietf:params:xml:ns:carddav}supported-address-data':
				parsed[key] = supportedAddressData(value);
				break;

			default:
				break;
		}
	});

	return parsed;
}

/**
 *
 * @param value
 * @returns {*}
 */
function text(value) {
	return value;
}

/**
 *
 * @param value
 * @returns {boolean}
 */
function bool(value) {
	return value === '1'
}

/**
 *
 * @param value
 * @returns {number}
 */
function int(value) {
	return parseInt(value, 10);
}

/**
 *
 * @param value
 * @returns {*}
 */
function supportedAddressData(value) {
	if (!Array.isArray(value)) {
		return;
	}

	return value.map((v) => {
		return {
			'content-type': v.getAttribute('content-type'),
			'version': v.getAttribute('version')
		};
	});
}
