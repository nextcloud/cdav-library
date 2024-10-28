/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2024 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as NS from '../utility/namespaceUtility.js'

/**
 * This function is capable of creating the propset xml structure for:
 * - '{urn:ietf:params:xml:ns:caldav}schedule-default-calendar-URL':
 *
 * @param {object} props
 * @return {object}
 */
export default function prinicipalPropSet(props) {
	const xmlified = []

	Object.entries(props).forEach(([key, value]) => {
		switch (key) {
		case '{urn:ietf:params:xml:ns:caldav}schedule-default-calendar-URL':
			xmlified.push({
				name: [NS.IETF_CALDAV, 'schedule-default-calendar-URL'],
				children: [
					{
						name: ['DAV:', 'href'],
						value,
					},
				],
			})
			break
		}
	})

	return xmlified
}
