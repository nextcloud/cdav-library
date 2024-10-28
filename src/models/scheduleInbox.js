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
import scheduleInboxPropSet from '../propset/scheduleInboxPropSet.js'

export default class ScheduleInbox extends Calendar {

	/**
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args)

		super._registerPropSetFactory(scheduleInboxPropSet)

		// https://tools.ietf.org/html/rfc7953#section-7.2.4
		super._exposeProperty('availability', NS.IETF_CALDAV, 'calendar-availability', true)
	}

	/**
	 * @inheritDoc
	 */
	static getPropFindList() {
		return super.getPropFindList().concat([
			[NS.IETF_CALDAV, 'calendar-availability'],
		])
	}

}
