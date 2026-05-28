/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2026 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { VObject } from './vobject.js'
import * as NS from '../utility/namespaceUtility.js'

/**
 * This class represents a deleted calendar object from a calendar trash bin.
 *
 * @augments VObject
 */
export class DeletedCalendarObject extends VObject {

	/**
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args)

		super._exposeProperty('calendarUri', NS.NEXTCLOUD, 'calendar-uri')
		super._exposeProperty('sourceCalendarUri', NS.NEXTCLOUD, 'source-calendar-uri')
		super._exposeProperty('calendarOwnerPrincipalUri', NS.NEXTCLOUD, 'calendar-owner-principal-uri')
		super._exposeProperty('deletedAt', NS.NEXTCLOUD, 'deleted-at')
	}

	get calendarUri() {
		return this._props[`{${NS.NEXTCLOUD}}calendar-uri`]
	}

	get sourceCalendarUri() {
		return this._props[`{${NS.NEXTCLOUD}}source-calendar-uri`]
	}

	get calendarOwnerPrincipalUri() {
		return this._props[`{${NS.NEXTCLOUD}}calendar-owner-principal-uri`]
	}

	get deletedAt() {
		return this._props[`{${NS.NEXTCLOUD}}deleted-at`]
	}

	get delegator() {
		return this._props[`{${NS.NEXTCLOUD}}delegator`]
	}

	/**
	 * @inheritDoc
	 */
	static getPropFindList() {
		return super.getPropFindList().concat([
			[NS.NEXTCLOUD, 'calendar-uri'],
			[NS.NEXTCLOUD, 'source-calendar-uri'],
			[NS.NEXTCLOUD, 'calendar-owner-principal-uri'],
			[NS.NEXTCLOUD, 'deleted-at'],
			[NS.NEXTCLOUD, 'delegator'],
		])
	}

}
