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

import * as NS from '../utility/namespaceUtility.js';

/**
 *
 * This parser is capable of parsing:
 * - {http://owncloud.org/ns}invite
 * - {http://calendarserver.org/ns/}allowed-sharing-modes
 *
 * @param {Object} props
 * @return {Object}
 */
export default function davCollectionShareableParser(props) {
	const parsed = {};

	Object.entries(props).forEach(([key, value]) => {
		switch (key) {
		case '{http://owncloud.org/ns}invite':
			parsed[key] = invite(value);
			break;

		case '{http://calendarserver.org/ns/}allowed-sharing-modes':
			parsed[key] = allowedSharingModes(value);
			break;

		default:
			break;
		}
	});

	return parsed;
}

/**
 *
 * @param value property node for {http://owncloud.org/ns}invite
 * @returns {*}
 */
function invite(value) {
	if (!Array.isArray(value)) {
		return;
	}

	const shares = [];
	value.forEach((s) => {
		let href = s.getElementsByTagNameNS(NS.DAV, 'href');
		if (href.length === 0) {
			return;
		}
		href = href[0].textContent;

		let displayName = s.getElementsByTagNameNS(NS.OWNCLOUD, 'common-name');
		if (displayName.length === 0) {
			displayName = null;
		} else {
			displayName = displayName[0].textContent;
		}

		let access = s.getElementsByTagNameNS(NS.OWNCLOUD, 'access');
		if (access.length === 0) {
			return;
		}
		access = access[0];

		const readWrite = access.getElementsByTagNameNS(NS.OWNCLOUD, 'read-write');
		const writable = readWrite.length !== 0;

		shares.push({
			href,
			displayName,
			writable
		});
	});

	return shares;
}

/**
 *
 * @param value property node for {http://calendarserver.org/ns/}allowed-sharing-modes
 * @returns {*}
 */
function allowedSharingModes(value) {
	if (!Array.isArray(value)) {
		return;
	}

	return value.map((v) => {
		return `{${v.namespaceURI}}${v.localName}`;
	});
}
