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

import { DavCollection } from './davCollection.js'
import * as NS from '../utility/namespaceUtility.js'

export default class ScheduleOutbox extends DavCollection {

	/**
	 * Sends a free-busy-request for the scheduling outbox
	 * The data is required to be a valid iTIP data.
	 * For an example, see https://tools.ietf.org/html/rfc6638#appendix-B.5
	 *
	 * @param {string} data iTIP with VFREEBUSY component and METHOD:REQUEST
	 * @return {Promise<string[]>}
	 */
	async freeBusyRequest(data) {
		const result = {}
		const response = await this._request.post(this.url, {
			'Content-Type': 'text/calendar; charset="utf-8"',
		}, data)

		const domParser = new DOMParser()
		const document = domParser.parseFromString(response.body, 'application/xml')

		const responses = document.evaluate('/cl:schedule-response/cl:response', document, NS.resolve, XPathResult.ANY_TYPE, null)
		let responseNode

		while ((responseNode = responses.iterateNext()) !== null) {
			const recipient = document.evaluate('string(cl:recipient/d:href)', responseNode, NS.resolve, XPathResult.ANY_TYPE, null).stringValue
			const status = document.evaluate('string(cl:request-status)', responseNode, NS.resolve, XPathResult.ANY_TYPE, null).stringValue
			const calendarData = document.evaluate('string(cl:calendar-data)', responseNode, NS.resolve, XPathResult.ANY_TYPE, null).stringValue
			const success = /^2.\d(;.+)?$/.test(status)

			result[recipient] = {
				calendarData,
				status,
				success,
			}
		}

		return result
	}

}
