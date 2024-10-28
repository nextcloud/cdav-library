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
 * - {DAV:}displayname
 *
 * @param {object} props
 * @return {object}
 */
export default function davCollectionPropSet(props) {
	const xmlified = []

	Object.entries(props).forEach(([key, value]) => {
		switch (key) {
		case '{DAV:}displayname':
			xmlified.push({
				name: [NS.DAV, 'displayname'],
				value,
			})
			break

		default:
			break
		}
	})

	return xmlified
}
