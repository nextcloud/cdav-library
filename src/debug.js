/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * creates a debug function bound to a context
 * @param {string} context
 * @return {Function}
 */
export function debugFactory(context) {
	return (...args) => {
		if (debugFactory.enabled) {
			// eslint-disable-next-line no-console
			console.debug(context, ...args)
		}
	}
}

debugFactory.enabled = false
