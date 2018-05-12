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
 * - {http://calendarserver.org/ns/}publish-url
 *
 * @param {Object} props
 * @return {Object}
 */
export default function davCollectionPublishableParser(props) {
	const parsed = {};

	Object.entries(props).forEach(([key, value]) => {
		switch (key) {
			case '{http://calendarserver.org/ns/}publish-url':
				parsed[key] = publishUrl(value);
				break;

			default:
				break;
		}
	});

	return parsed;
}


/**
 *
 * @param value property node for {http://calendarserver.org/ns/}publish-url
 * @returns {*}
 */
function publishUrl(value) {
	if (!Array.isArray(value)) {
		return;
	}
	if (value.length < 1) {
		return;
	}

	return value[0].textContent;
}
