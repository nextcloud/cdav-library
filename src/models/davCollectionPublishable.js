/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import * as NS from '../utility/namespaceUtility.js'
import * as XMLUtility from '../utility/xmlUtility.js'

import { debugFactory } from '../debug.js'
const debug = debugFactory('DavCollectionPublishable')

export function davCollectionPublishable(Base) {
	return class extends Base {

		/**
		 * @inheritDoc
		 */
		constructor(...args) {
			super(...args)

			super._exposeProperty('publishURL', NS.CALENDARSERVER, 'publish-url')
		}

		/**
		 * publishes the DavCollection
		 *
		 * @return {Promise<void>}
		 */
		async publish() {
			debug(`Publishing ${this.url}`)

			const [skeleton] = XMLUtility.getRootSkeleton(
				[NS.CALENDARSERVER, 'publish-calendar'])
			const xml = XMLUtility.serialize(skeleton)

			// TODO - ideally the server should return a 'pre-publish-url' as described in the standard

			await this._request.post(this._url, { 'Content-Type': 'application/xml; charset=utf-8' }, xml)
			await this._updatePropsFromServer()
		}

		/**
		 * unpublishes the DavCollection
		 *
		 * @return {Promise<void>}
		 */
		async unpublish() {
			debug(`Unpublishing ${this.url}`)

			const [skeleton] = XMLUtility.getRootSkeleton(
				[NS.CALENDARSERVER, 'unpublish-calendar'])
			const xml = XMLUtility.serialize(skeleton)

			await this._request.post(this._url, { 'Content-Type': 'application/xml; charset=utf-8' }, xml)
			delete this._props['{http://calendarserver.org/ns/}publish-url']
		}

		/**
		 * @inheritDoc
		 */
		static getPropFindList() {
			return super.getPropFindList().concat([
				[NS.CALENDARSERVER, 'publish-url'],
			])
		}

	}
}
