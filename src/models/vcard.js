/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { DavObject } from './davObject.js'
import * as NS from '../utility/namespaceUtility.js'

/**
 * @class
 */
export class VCard extends DavObject {

	/**
	 * Creates a VCard that is supposed to store address-data
	 * as specified in RFC 6350.
	 *
	 * https://tools.ietf.org/html/rfc6350
	 *
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args)

		super._exposeProperty('data', NS.IETF_CARDDAV, 'address-data', true)
		super._exposeProperty('hasphoto', NS.NEXTCLOUD, 'has-photo', false)
	}

	/**
	 * @inheritDoc
	 */
	static getPropFindList() {
		return super.getPropFindList().concat([
			[NS.IETF_CARDDAV, 'address-data'],
		])
	}

}
