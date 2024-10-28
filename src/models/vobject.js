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
export class VObject extends DavObject {

	/**
	 * Creates a VObject that is supposed to store calendar-data
	 * as specified in RFC 5545.
	 *
	 * https://tools.ietf.org/html/rfc5545
	 *
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args)

		super._exposeProperty('data', NS.IETF_CALDAV, 'calendar-data', true)
	}

	/**
	 * @inheritDoc
	 */
	static getPropFindList() {
		return super.getPropFindList().concat([
			[NS.IETF_CALDAV, 'calendar-data'],
		])
	}

}
