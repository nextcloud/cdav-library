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
 * - {DAV:}acl
 * - {DAV:}displayname
 * - {DAV:}owner
 * - {DAV:}resourcetype
 * - {DAV:}sync-token
 *
 * @param {Object} props
 * @return {Object}
 */
export default function davCollectionParser(props) {
	const parsed = {};

	Object.entries(props).forEach(([key, value, ]) => {
		switch (key) {
		case '{DAV:}acl':
			parsed[key] = acl(value);
			break;

		case '{DAV:}displayname':
		case '{DAV:}sync-token':
			parsed[key] = simpleText(value);
			break;

		case '{DAV:}owner':
			parsed[key] = owner(value);
			break;

		case '{DAV:}resourcetype':
			parsed[key] = resourceType(value);
			break;

		default:
			break;
		}
	});

	return parsed;
}

function simpleText(prop) {
	return prop;
}

// TODO - this does the bare minimum at the moment
// we should properly implement https://tools.ietf.org/html/rfc3744#section-5.5
function acl(props) {
	const simple = [];

	props.forEach((ace) => {
		const aceChildren = ace.childNodes;

		const principal = {};
		let obj = { principal, grant: [], deny: [], protect: [], inherit: [], };

		aceChildren.forEach((aceChild) => {
			if (aceChild.namespaceURI === 'DAV:' && aceChild.localName === 'principal') {
				const principalChild = aceChild.children[0];

				principal.type = principalChild.localName;
				if (principalChild.localName === 'href') {
					principal.href = principalChild.textContent;
				}

				return true;
			}

			return false;
		});

		const existingPrincipal = simple.find((s) => {
			if (s.principal.type === principal.type && s.principal.href === principal.href) {
				obj = s;
				return true;
			}

			return false;
		});
		if (!existingPrincipal) {
			simple.push(obj);
		}

		aceChildren.forEach((aceChild) => {
			if (aceChild.namespaceURI === 'DAV:' && aceChild.localName === 'grant') {
				aceChild.childNodes.forEach((grantChild) => {
					if (grantChild.namespaceURI !== 'DAV:' || grantChild.localName !== 'privilege') {
						return;
					}

					obj.grant.push('{' + grantChild.children[0].namespaceURI + '}' + grantChild.children[0].localName);
				});
			}

			// TODO - implement deny

			// TODO - implement protect

			// TODO - implement inherit
		});
	});

	return simple;
}

function owner(prop) {
	return prop[0].textContent;
}

function resourceType(prop) {
	return prop.map((prop) => {
		return '{' + prop.namespaceURI + '}' + prop.localName;
	});
}
