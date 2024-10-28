/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { Calendar } from './calendar.js'
import * as NS from '../utility/namespaceUtility.js'

/**
 * This class represents a subscription collection
 * It is being cached on the Nextcloud server and allows to be queried by standard CalDAV requests.
 *
 * On top of that it contains more non-standard apple properties
 */
export class Subscription extends Calendar {

	/**
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args)

		super._exposeProperty('source', NS.CALENDARSERVER, 'source', true)
		super._exposeProperty('refreshRate', NS.APPLE, 'refreshrate', true)
		super._exposeProperty('stripTodos', NS.CALENDARSERVER, 'subscribed-strip-todos', true)
		super._exposeProperty('stripAlarms', NS.CALENDARSERVER, 'subscribed-strip-alarms', true)
		super._exposeProperty('stripAttachments', NS.CALENDARSERVER, 'subscribed-strip-attachments', true)
	}

	/**
	 * @inheritDoc
	 */
	static getPropFindList() {
		return super.getPropFindList().concat([
			[NS.CALENDARSERVER, 'source'],
			[NS.APPLE, 'refreshrate'],
			[NS.CALENDARSERVER, 'subscribed-strip-todos'],
			[NS.CALENDARSERVER, 'subscribed-strip-alarms'],
			[NS.CALENDARSERVER, 'subscribed-strip-attachments'],
		])
	}

}
