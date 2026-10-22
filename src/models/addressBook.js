/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { debugFactory } from '../debug.js'
import addressBookPropSet from '../propset/addressBookPropSet.js'
import * as NS from '../utility/namespaceUtility.js'
import * as StringUtility from '../utility/stringUtility.js'
import * as XMLUtility from '../utility/xmlUtility.js'
import { DavCollection } from './davCollection.js'
import { davCollectionShareable } from './davCollectionShareable.js'
import { VCard } from './vcard.js'
const debug = debugFactory('AddressBook')

/**
 * @typedef {object} AddressBookQueryPage
 * @property {VCard[]} vcards VCards of this page
 * @property {string|null} continuationToken Token to request the next page, null for the last page
 */

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
 */
export class AddressBook extends davCollectionShareable(DavCollection) {
	/**
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args)

		super._registerObjectFactory('text/vcard', VCard)
		super._registerPropSetFactory(addressBookPropSet)

		// Type declarations for properties installed dynamically below.
		/**
		 * @type {string | undefined}
		 */
		this.description
		/**
		 * @type {boolean | undefined}
		 */
		this.enabled
		/**
		 * @type {boolean | undefined}
		 * @readonly
		 */
		this.readOnly

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
		return this.addressbookQuery(null, AddressBook._getSimplePropertiesProp(props))
	}

	/**
	 * finds one page of contacts in an address-book, but with filtered data.
	 * Only use this when DavClient#isAddressBookQueryContinuationSupported() returns true,
	 * because other servers may truncate the result without signalling it.
	 *
	 * Example use:
	 * findPageAndFilterBySimpleProperties(['EMAIL', 'UID', 'FN'], { limit: 50 })
	 * findPageAndFilterBySimpleProperties(['EMAIL', 'UID', 'FN'], { limit: 50, continuationToken: page.continuationToken })
	 *
	 * @param {string[]} props Names of the vCard properties to retrieve
	 * @param {object} options Paging and filter options
	 * @param {number} options.limit Maximum number of vcards in the page
	 * @param {string|null} [options.continuationToken] Token of the previous page, null for the first page
	 * @param {object[]|null} [options.filter] Children of the CARDDAV:filter element, null for all contacts
	 * @param {string} [options.test] Either anyof or allof
	 * @return {Promise<AddressBookQueryPage>}
	 */
	async findPageAndFilterBySimpleProperties(props, { limit, continuationToken = null, filter = null, test = 'anyof' }) {
		return this.addressbookQueryPage(filter, AddressBook._getSimplePropertiesProp(props), { limit, test, continuationToken })
	}

	/**
	 * creates a new VCard object in this address book
	 *
	 * @overload
	 * @param {string} data
	 * @param {{ fetch?: true }} [options] Fetch the created object from the server (default)
	 * @return {Promise<VCard>}
	 */
	/**
	 * @overload
	 * @param {string} data
	 * @param {{ fetch: false }} options Skip fetching the created object from the server
	 * @return {Promise<null>}
	 */
	/**
	 * @param {string} data
	 * @param {{ fetch?: boolean }} [options] Whether to fetch the created object from the server
	 * @return {Promise<VCard|null>}
	 */
	async createVCard(data, options = {}) {
		debug('creating VCard object')

		const name = StringUtility.uid('', 'vcf')
		const headers = {
			'Content-Type': 'text/vcard; charset=utf-8',
		}

		return super.createObject(name, headers, data, options)
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
		const { vcards } = await this.addressbookQueryPage(filter, prop, { limit, test })
		return vcards
	}

	/**
	 * sends an addressbook query as defined in
	 * https://tools.ietf.org/html/rfc6352#section-8.6
	 * and returns the continuation token of a truncated result.
	 *
	 * A truncated result is signalled by a 507 response for the address book
	 * (RFC 6352 §8.6.2) carrying a {http://sabredav.org/ns}continuation-token.
	 * Pass that token back with the same filter, test and limit to get the next page.
	 *
	 * @param {object[]|null} filter Children of the CARDDAV:filter element, null for all contacts
	 * @param {object[]|null} prop Children of the DAV:prop element, null for the default property list
	 * @param {object} [options] Paging and filter options
	 * @param {number|null} [options.limit] Maximum number of vcards in the page
	 * @param {string} [options.test] Either anyof or allof
	 * @param {string|null} [options.continuationToken] Token of the previous page, null for the first page
	 * @return {Promise<AddressBookQueryPage>}
	 */
	async addressbookQueryPage(filter = null, prop = null, { limit = null, test = 'anyof', continuationToken = null } = {}) {
		debug('sending an addressbook-query request')

		const [skeleton] = XMLUtility.getRootSkeleton([NS.IETF_CARDDAV, 'addressbook-query'])

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

		if (continuationToken) {
			skeleton.children.push({
				name: [NS.SABREDAV, 'continuation-token'],
				value: continuationToken,
			})
		}

		const headers = {
			Depth: '1',
		}
		const body = XMLUtility.serialize(skeleton)
		const response = await this._request.report(this.url, headers, body)
		return {
			vcards: super._handleMultiStatusResponse(response, AddressBook._isRetrievalPartial(prop)),
			continuationToken: AddressBook._extractContinuationToken(response),
		}
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
		const [skeleton] = XMLUtility.getRootSkeleton([NS.IETF_CARDDAV, 'addressbook-multiget'])

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

	/**
	 * builds the prop part of a report requesting a set of simple vCard properties
	 *
	 * @param {string[]} props
	 * @return {object[]}
	 * @private
	 */
	static _getSimplePropertiesProp(props) {
		return [{
			name: [NS.DAV, 'getetag'],
		}, {
			name: [NS.DAV, 'getcontenttype'],
		}, {
			name: [NS.DAV, 'resourcetype'],
		}, {
			name: [NS.IETF_CARDDAV, 'address-data'],
			children: props.map((prop) => ({
				name: [NS.IETF_CARDDAV, 'prop'],
				attributes: [['name', prop]],
			})),
		}, {
			name: [NS.NEXTCLOUD, 'has-photo'],
		}, {
			name: [NS.NEXTCLOUD, 'favorite'],
		}]
	}

	/**
	 * extracts the continuation token from the 507 response of a truncated addressbook-query
	 *
	 * @param {{statusResponses?: {status: number, elements: Object<string, string>}[]}} response Response of the REPORT request
	 * @return {string|null} null when the result was not truncated or the server sent no token
	 * @private
	 */
	static _extractContinuationToken(response) {
		const truncated = (response.statusResponses ?? []).find((r) => r.status === 507)
		return truncated?.elements[`{${NS.SABREDAV}}continuation-token`] ?? null
	}
}
