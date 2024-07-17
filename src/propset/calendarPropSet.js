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

import * as NS from '../utility/namespaceUtility.js'

/**
 *
 * This function is capable of creating the propset xml structure for:
 * - {http://apple.com/ns/ical/}calendar-order
 * - {http://apple.com/ns/ical/}calendar-color
 * - {http://calendarserver.org/ns/}source
 * - {urn:ietf:params:xml:ns:caldav}calendar-description
 * - {urn:ietf:params:xml:ns:caldav}calendar-timezone
 * - {http://owncloud.org/ns}calendar-enabled
 *
 * @param {object} props
 * @return {object}
 */
export default function calendarPropSet(props) {
	const xmlified = []

	Object.entries(props).forEach(([key, value]) => {
		switch (key) {
		case '{http://apple.com/ns/ical/}calendar-order':
			xmlified.push({
				name: [NS.APPLE, 'calendar-order'],
				value: value.toString(),
			})
			break

		case '{http://apple.com/ns/ical/}calendar-color':
			xmlified.push({
				name: [NS.APPLE, 'calendar-color'],
				value,
			})
			break

		case '{http://calendarserver.org/ns/}source':
			xmlified.push({
				name: [NS.CALENDARSERVER, 'source'],
				children: [{
					name: [NS.DAV, 'href'],
					value,
				}],
			})
			break

		case '{urn:ietf:params:xml:ns:caldav}calendar-description':
			xmlified.push({
				name: [NS.IETF_CALDAV, 'calendar-description'],
				value,
			})
			break

		case '{urn:ietf:params:xml:ns:caldav}calendar-timezone':
			xmlified.push({
				name: [NS.IETF_CALDAV, 'calendar-timezone'],
				value,
			})
			break

		case '{http://owncloud.org/ns}calendar-enabled':
			xmlified.push({
				name: [NS.OWNCLOUD, 'calendar-enabled'],
				value: value ? '1' : '0',
			})
			break
		case '{urn:ietf:params:xml:ns:caldav}schedule-calendar-transp':
			xmlified.push({
				name: [NS.IETF_CALDAV, 'schedule-calendar-transp'],
				children: [{
					name: [NS.IETF_CALDAV, value],
				}],
			})
			break
		default:
			break
		}
	})

	return xmlified
}
