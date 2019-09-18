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

import { Calendar } from './calendar.js';
import * as NS from '../utility/namespaceUtility.js';

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
		super(...args);

		super._exposeProperty('source', NS.CALENDARSERVER, 'source', true);
		super._exposeProperty('refreshRate', NS.APPLE, 'refreshrate', true);
		super._exposeProperty('stripTodos', NS.CALENDARSERVER, 'subscribed-strip-todos', true);
		super._exposeProperty('stripAlarms', NS.CALENDARSERVER, 'subscribed-strip-alarms', true);
		super._exposeProperty('stripAttachments', NS.CALENDARSERVER, 'subscribed-strip-attachments', true);
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
			[NS.CALENDARSERVER, 'subscribed-strip-attachments']
		]);
	}

}
