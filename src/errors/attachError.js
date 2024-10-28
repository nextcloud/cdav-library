/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Generic error class that allows attaching more than just a message
 *
 * @abstract
 */
export default class AttachError extends Error {

	/**
	 *
	 * @param {object} attach
	 */
	constructor(attach) {
		super()

		Object.assign(this, attach)
	}

}
