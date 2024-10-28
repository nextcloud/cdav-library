/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// uuidv4 taken from https://stackoverflow.com/a/2117523
function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8)
		return v.toString(16).toUpperCase()
	})
}

/**
 * generates a unique id with the option to pass a prefix and a filetype
 *
 * @param {string} prefix
 * @param {string} suffix
 * @return {string}
 */
export function uid(prefix, suffix) {
	prefix = prefix || ''
	suffix = suffix || ''

	if (prefix !== '') {
		prefix += '-'
	}
	if (suffix !== '') {
		suffix = '.' + suffix
	}

	return prefix + uuidv4() + suffix
}

/**
 * generates a uri and checks with isAvailable, whether or not the uri is still available
 *
 * @param {string} start
 * @param {Function} isAvailable
 * @return {string}
 */
export function uri(start, isAvailable) {
	start = start || ''

	let uri = start.toString().toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w-]+/g, '') // Remove all non-word chars
		.replace(/--+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, '') // Trim - from end of text

	if (uri === '') {
		uri = '-'
	}

	if (isAvailable(uri)) {
		return uri
	}

	if (uri.indexOf('-') === -1) {
		uri = uri + '-1'
		if (isAvailable(uri)) {
			return uri
		}
	}

	// === false because !undefined = true, possible infinite loop
	do {
		const positionLastDash = uri.lastIndexOf('-')
		const firstPart = uri.slice(0, positionLastDash)
		let lastPart = uri.slice(positionLastDash + 1)

		if (lastPart.match(/^\d+$/)) {
			lastPart = parseInt(lastPart)
			lastPart++

			uri = firstPart + '-' + lastPart
		} else {
			uri = uri + '-1'
		}
	} while (isAvailable(uri) === false)

	return uri
}
