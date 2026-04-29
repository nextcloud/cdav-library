/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as NS from '../utility/namespaceUtility.js'

/**
 *
 * This function is capable of creating the propset xml structure for:
 * - {http://nextcloud.com/ns}favorite
 *
 * @param {object} props
 * @return {object}
 */
export default function vcardPropSet(props) {
	const xmlified = []

	Object.entries(props).forEach(([key, value]) => {
		switch (key) {
		case '{http://nextcloud.com/ns}favorite':
			xmlified.push({
				name: [NS.NEXTCLOUD, 'favorite'],
				value: value ? '1' : null,
			})
			break

		default:
			break
		}
	})

	return xmlified
}
