/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
