/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export default class DAVEvent {

	/**
	 *
	 * @param {string} type
	 * @param {object} options
	 */
	constructor(type, options = {}) {
		Object.assign(this, {
			type,
		}, options)
	}

}
