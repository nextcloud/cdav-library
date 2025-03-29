/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { davCollectionShareable } from './davCollectionShareable.js'
import { DavCollection } from './davCollection.js'
import * as NS from '../utility/namespaceUtility.js'
import * as StringUtility from '../utility/stringUtility.js'
import * as XMLUtility from '../utility/xmlUtility.js'
import addressBookPropSet from '../propset/addressBookPropSet.js'
import { VCard } from './vcard.js'

import { debugFactory } from '../debug.js'
const debug = debugFactory('AddressBook')

/**
 * This class represents an address book collection as specified in
 * https://tools.ietf.org/html/rfc6352#section-5.2
 *
 * On top of all the properties provided by davCollectionShareable and DavCollection,
 * It allows you access to the following list of properties:
 * - description
 * - enabled
 * - readOnly
 *
 * The first two allowing read-write access
 *
 * @augments DavCollection
 */
export class AddressBook extends davCollectionShareable(DavCollection) {

	/**
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args)

		super._registerObjectFactory('text/vcard', VCard)
		super._registerPropSetFactory(addressBookPropSet)

		super._exposeProperty('description', NS.IETF_CARDDAV, 'addressbook-description', true)
		super._exposeProperty('enabled', NS.OWNCLOUD, 'enabled', true)
		super._exposeProperty('readOnly', NS.OWNCLOUD, 'read-only')
	}

	/**
	 * finds all VCards in this address book
	 *
	 * @return {Promise<VCard[]>}
	 */
	findAllVCards() {
		return super.findAllByFilter((elm) => elm instanceof VCard)
	}

	/**
	 * finds all contacts in an address-book, but with filtered data.
	 *
	 * Example use:
	 * findAllAndFilterBySimpleProperties(['EMAIL', 'UID', 'CATEGORIES', 'FN', 'TEL', 'NICKNAME', 'N'])
	 *
	 * @param {string[]} props
	 * @return {Promise<VCard[]>}
	 */
	async findAllAndFilterBySimpleProperties(props) {
		const children = []
		props.forEach((prop) => {
			children.push({
				name: [NS.IETF_CARDDAV, 'prop'],
				attributes: [['name', prop]],
			})
		})

		return this.addressbookQuery(null, [{
			name: [NS.DAV, 'getetag'],
		}, {
			name: [NS.DAV, 'getcontenttype'],
		}, {
			name: [NS.DAV, 'resourcetype'],
		}, {
			name: [NS.IETF_CARDDAV, 'address-data'],
			children,
		}, {
			name: [NS.NEXTCLOUD, 'has-photo'],
		}])
	}

	/**
	 * creates a new VCard object in this address book
	 *
	 * @param {string} data
	 * @return {Promise<VCard>}
	 */
	async createVCard(data) {
		debug('creating VCard object')

		const name = StringUtility.uid('', 'vcf')
		const headers = {
			'Content-Type': 'text/vcard; charset=utf-8',
		}

		return super.createObject(name, headers, data)
	}

	/**
	 * sends an addressbook query as defined in
	 * https://tools.ietf.org/html/rfc6352#section-8.6
	 *
	 * @param {object[]} filter
	 * @param {object[]} prop
	 * @param {number} limit
	 * @param {string} test Either anyof or allof
	 * @return {Promise<VCard[]>}
	 */
	async addressbookQuery(filter, prop = null, limit = null, test = 'anyof') {
		debug('sending an addressbook-query request')

		const [skeleton] = XMLUtility.getRootSkeleton(
			[NS.IETF_CARDDAV, 'addressbook-query'],
		)

		if (!prop) {
			skeleton.children.push({
				name: [NS.DAV, 'prop'],
				children: this._propFindList.map((p) => ({ name: p })),
			})
		} else {
			skeleton.children.push({
				name: [NS.DAV, 'prop'],
				children: prop,
			})
		}

		// According to the spec, every address-book query needs a filter,
		// but Nextcloud just returns all elements without a filter.
		if (filter) {
			skeleton.children.push({
				name: [NS.IETF_CARDDAV, 'filter'],
				attributes: [
					['test', test],
				],
				children: filter,
			})
		}

		if (limit) {
			skeleton.children.push({
				name: [NS.IETF_CARDDAV, 'limit'],
				children: [{
					name: [NS.IETF_CARDDAV, 'nresults'],
					value: limit,
				}],
			})
		}

		const headers = {
			Depth: '1',
		}
		const body = XMLUtility.serialize(skeleton)
		const response = await this._request.report(this.url, headers, body)
		return super._handleMultiStatusResponse(response, AddressBook._isRetrievalPartial(prop))
	}

	/**
	 * sends an addressbook multiget query as defined in
	 * https://tools.ietf.org/html/rfc6352#section-8.7
	 *
	 * @param {string[]} hrefs
	 * @param {object[]} prop
	 * @return {Promise<VCard[]>}
	 */
	async addressbookMultiget(hrefs = [], prop) {
		debug('sending an addressbook-multiget request')

		if (hrefs.length === 0) {
			return []
		}

		const headers = {
			Depth: '1',
		}
		const body = this._buildMultiGetBody(hrefs, prop)
		const response = await this._request.report(this.url, headers, body)
		return super._handleMultiStatusResponse(response, AddressBook._isRetrievalPartial(prop))
	}

	/**
	 * sends an addressbook multiget query as defined in
	 * https://tools.ietf.org/html/rfc6352#section-8.7
	 * and requests a download of the result
	 *
	 * @param {string[]} hrefs
	 * @param {object[]} prop
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async addressbookMultigetExport(hrefs = [], prop) {
		debug('sending an addressbook-multiget request and request download')

		if (hrefs.length === 0) {
			return ''
		}

		const headers = {
			Depth: '1',
		}
		const body = this._buildMultiGetBody(hrefs, prop)
		return this._request.report(this.url + '?export', headers, body)
	}

	/**
	 *
	 * @param {string[]} hrefs
	 * @param {object[]} prop
	 * @return String
	 * @private
	 */
	_buildMultiGetBody(hrefs, prop) {
		const [skeleton] = XMLUtility.getRootSkeleton(
			[NS.IETF_CARDDAV, 'addressbook-multiget'],
		)

		if (!prop) {
			skeleton.children.push({
				name: [NS.DAV, 'prop'],
				children: this._propFindList.map((p) => ({ name: p })),
			})
		} else {
			skeleton.children.push({
				name: [NS.DAV, 'prop'],
				children: prop,
			})
		}

		hrefs.forEach((href) => {
			skeleton.children.push({
				name: [NS.DAV, 'href'],
				value: href,
			})
		})

		return XMLUtility.serialize(skeleton)
	}

	/**
	 * @inheritDoc
	 */
	static getPropFindList() {
		return super.getPropFindList().concat([
			[NS.IETF_CARDDAV, 'addressbook-description'],
			[NS.IETF_CARDDAV, 'supported-address-data'],
			[NS.IETF_CARDDAV, 'max-resource-size'],
			[NS.CALENDARSERVER, 'getctag'],
			[NS.OWNCLOUD, 'enabled'],
			[NS.OWNCLOUD, 'read-only'],
		])
	}

	/**
	 * checks if the prop part of a report requested partial data
	 *
	 * @param {object[]} prop
	 * @return {boolean}
	 * @private
	 */
	static _isRetrievalPartial(prop) {
		if (!prop) {
			return false
		}

		const addressBookDataProperty = prop.find((p) => {
			return p.name[0] === NS.IETF_CARDDAV && p.name[1] === 'address-data'
		})

		if (!addressBookDataProperty) {
			return false
		}

		return !!addressBookDataProperty.children
	}

}
