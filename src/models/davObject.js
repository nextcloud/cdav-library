/**
 * CDAV Library
 *
 * This library is part of the Nextcloud project
 *
 * SPDX-FileCopyrightText: 2018 Nextcloud GmbH and Nextcloud contributors
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import DAVEventListener from './davEventListener.js'
import NetworkRequestClientError from '../errors/networkRequestClientError.js'
import * as NS from '../utility/namespaceUtility.js'

import { debugFactory } from '../debug.js'
const debug = debugFactory('DavObject')

/**
 * @class
 * @classdesc Generic DavObject aka file
 */
export class DavObject extends DAVEventListener {

	/**
	 * @param {DavCollection} parent - The parent collection this DavObject is a child of
	 * @param {Request} request - The request object initialized by DavClient
	 * @param {string} url - Full url of this DavObject
	 * @param {object} props - Properties including etag, content-type, etc.
	 * @param {boolean} isPartial - Are we dealing with the complete or just partial addressbook / calendar data
	 */
	constructor(parent, request, url, props, isPartial = false) {
		super()

		Object.assign(this, {
			// parameters
			_parent: parent,
			_request: request,
			_url: url,
			_props: props,
			// housekeeping
			_isPartial: isPartial,
			_isDirty: false,
		})

		this._exposeProperty('etag', NS.DAV, 'getetag', true)
		this._exposeProperty('contenttype', NS.DAV, 'getcontenttype')

		Object.defineProperty(this, 'url', {
			get: () => this._url,
		})
	}

	/**
	 * gets unfiltered data for this object
	 *
	 * @param {boolean} forceReFetch Always refetch data, even if not partial
	 * @return {Promise<void>}
	 */
	async fetchCompleteData(forceReFetch = false) {
		if (!forceReFetch && !this.isPartial()) {
			return
		}

		const request = await this._request.propFind(this._url, this.constructor.getPropFindList(), 0)
		this._props = request.body
		this._isDirty = false
		this._isPartial = false
	}

	/**
	 * copies a DavObject to a different DavCollection
	 * @param {DavCollection} collection
	 * @param {boolean} overwrite
	 * @param headers
	 * @return {Promise<DavObject>} Promise that resolves to the copied DavObject
	 */
	async copy(collection, overwrite = false, headers = {}) {
		debug(`copying ${this.url} from ${this._parent.url} to ${collection.url}`)

		if (this._parent === collection) {
			throw new Error('Copying an object to the collection it\'s already part of is not supported')
		}
		if (!this._parent.isSameCollectionTypeAs(collection)) {
			throw new Error('Copying an object to a collection of a different type is not supported')
		}
		if (!collection.isWriteable()) {
			throw new Error('Can not copy object into read-only destination collection')
		}

		const uri = this.url.split('/').splice(-1, 1)[0]
		const destination = collection.url + uri

		await this._request.copy(this.url, destination, 0, overwrite, headers)
		return collection.find(uri)
	}

	/**
	 * moves a DavObject to a different DavCollection
	 * @param {DavCollection} collection
	 * @param {boolean} overwrite
	 * @param headers
	 * @return {Promise<void>}
	 */
	async move(collection, overwrite = false, headers = {}) {
		debug(`moving ${this.url} from ${this._parent.url} to ${collection.url}`)

		if (this._parent === collection) {
			throw new Error('Moving an object to the collection it\'s already part of is not supported')
		}
		if (!this._parent.isSameCollectionTypeAs(collection)) {
			throw new Error('Moving an object to a collection of a different type is not supported')
		}
		if (!collection.isWriteable()) {
			throw new Error('Can not move object into read-only destination collection')
		}

		const uri = this.url.split('/').splice(-1, 1)[0]
		const destination = collection.url + uri

		await this._request.move(this.url, destination, overwrite, headers)
		this._parent = collection
		this._url = destination
	}

	/**
	 * updates the DavObject on the server
	 * @return {Promise<void>}
	 */
	async update() {
		// 1. Do not update filtered objects, because we would be loosing data on the server
		// 2. No need to update if object was never modified
		// 3. Do not update if called directly on DavObject, because there is no data prop
		if (this.isPartial() || !this.isDirty() || !this.data) {
			return
		}

		const headers = {}

		// updating an object should use it's content-type
		if (this.contenttype) {
			headers['Content-Type'] = `${this.contenttype}; charset=utf-8`
		}
		if (this.etag) {
			headers['If-Match'] = this.etag
		}

		return this._request.put(this.url, headers, this.data).then((res) => {
			this._isDirty = false
			// Don't overwrite content-type, it's set to text/html in the response ...
			this._props['{DAV:}getetag'] = res.headers.etag || null
		}).catch((ex) => {
			this._isDirty = true

			if (ex instanceof NetworkRequestClientError && ex.status === 412) {
				this._isPartial = true
			}

			throw ex
		})
	}

	/**
	 * deletes the DavObject on the server
	 *
	 * @param headers
	 * @return {Promise<{body: string|object, status: number, headers: object}>}
	 */
	async delete(headers = {}) {
		return this._request.delete(this.url, headers)
	}

	/**
	 * returns whether the data in this DavObject is the result of a partial retrieval
	 *
	 * @return {boolean}
	 */
	isPartial() {
		return this._isPartial
	}

	/**
	 * returns whether the data in this DavObject contains unsynced changes
	 *
	 * @return {boolean}
	 */
	isDirty() {
		return this._isDirty
	}

	/**
	 * @protected
	 * @param {string} localName
	 * @param {string} xmlNamespace
	 * @param {string} xmlName
	 * @param {boolean} mutable
	 * @return void
	 */
	_exposeProperty(localName, xmlNamespace, xmlName, mutable = false) {
		if (mutable) {
			Object.defineProperty(this, localName, {
				get: () => this._props[`{${xmlNamespace}}${xmlName}`],
				set: (val) => {
					this._isDirty = true
					this._props[`{${xmlNamespace}}${xmlName}`] = val
				},
			})
		} else {
			Object.defineProperty(this, localName, {
				get: () => this._props[`{${xmlNamespace}}${xmlName}`],
			})
		}
	}

	/**
	 * A list of all property names that should be included
	 * in propfind requests that may include this object
	 *
	 * @return {string[][]}
	 */
	static getPropFindList() {
		return [
			[NS.DAV, 'getcontenttype'],
			[NS.DAV, 'getetag'],
			[NS.DAV, 'resourcetype'],
		]
	}

}
