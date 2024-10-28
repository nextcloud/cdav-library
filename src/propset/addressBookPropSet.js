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
 * - {urn:ietf:params:xml:ns:carddav}addressbook-description
 * - {http://owncloud.org/ns}enabled
 *
 * @param {object} props
 * @return {object}
 */
export default function addressBookPropSet(props) {
	const xmlified = []

	Object.entries(props).forEach(([key, value]) => {
		switch (key) {
		case '{urn:ietf:params:xml:ns:carddav}addressbook-description':
			xmlified.push({
				name: [NS.IETF_CARDDAV, 'addressbook-description'],
				value,
			})
			break

		case '{http://owncloud.org/ns}enabled':
			xmlified.push({
				name: [NS.OWNCLOUD, 'enabled'],
				value: value ? '1' : '0',
			})
			break

		default:
			break
		}
	})

	return xmlified
}
