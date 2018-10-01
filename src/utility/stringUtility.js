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

// uuidv4 taken from https://stackoverflow.com/a/2117523
function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0; const v = c === 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16).toUpperCase();
	});
}

/**
 * generates a unique id with the option to pass a prefix and a filetype
 *
 * @param {string} prefix
 * @param {string} suffix
 * @returns {string}
 */
export function uid(prefix, suffix) {
	prefix = prefix || '';
	suffix = suffix || '';

	if (prefix !== '') {
		prefix += '-';
	}
	if (suffix !== '') {
		suffix = '.' + suffix;
	}

	return prefix + uuidv4() + suffix;
}

/**
 * generates a uri and checks with isAvailable, whether or not the uri is still available
 *
 * @param {string} start
 * @param {Function} isAvailable
 * @returns {string}
 */
export function uri(start, isAvailable) {
	start = start || '';

	let uri = start.toString().toLowerCase()
		.replace(/\s+/g, '-') // Replace spaces with -
		.replace(/[^\w\-]+/g, '') // Remove all non-word chars
		.replace(/\-\-+/g, '-') // Replace multiple - with single -
		.replace(/^-+/, '') // Trim - from start of text
		.replace(/-+$/, ''); // Trim - from end of text

	if (uri === '') {
		uri = '-';
	}

	if (isAvailable(uri)) {
		return uri;
	}

	if (uri.indexOf('-') === -1) {
		uri = uri + '-1';
		if (isAvailable(uri)) {
			return uri;
		}
	}

	// === false because !undefined = true, possible infinite loop
	do {
		const positionLastDash = uri.lastIndexOf('-');
		const firstPart = uri.substr(0, positionLastDash);
		let lastPart = uri.substr(positionLastDash + 1);

		if (lastPart.match(/^\d+$/)) {
			lastPart = parseInt(lastPart);
			lastPart++;

			uri = firstPart + '-' + lastPart;
		} else {
			uri = uri + '-1';
		}
	} while (isAvailable(uri) === false);

	return uri;
}
