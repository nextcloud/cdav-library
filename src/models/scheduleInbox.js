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
