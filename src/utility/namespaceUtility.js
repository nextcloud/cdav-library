/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

export const DAV = 'DAV:'
export const IETF_CALDAV = 'urn:ietf:params:xml:ns:caldav'
export const IETF_CARDDAV = 'urn:ietf:params:xml:ns:carddav'
export const OWNCLOUD = 'http://owncloud.org/ns'
export const NEXTCLOUD = 'http://nextcloud.com/ns'
export const APPLE = 'http://apple.com/ns/ical/'
export const CALENDARSERVER = 'http://calendarserver.org/ns/'
export const SABREDAV = 'http://sabredav.org/ns'

export const NS_MAP = {
	d: DAV,
	cl: IETF_CALDAV,
	cr: IETF_CARDDAV,
	oc: OWNCLOUD,
	nc: NEXTCLOUD,
	aapl: APPLE,
	cs: CALENDARSERVER,
	sd: SABREDAV,
}

/**
 * maps namespace like DAV: to it's short equivalent
 *
 * @param {string} short
 * @return {string}
 */
export function resolve(short) {
	return NS_MAP[short] || null
}
