/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
