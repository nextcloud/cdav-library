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

import DAVEventListener from './davEventListener.js';
import NetworkRequestClientError from '../errors/networkRequestClientError.js';
import * as NS from '../utility/namespaceUtility.js';

import { debugFactory } from '../debug.js';
const debug = debugFactory('DavObject');

/**
 * @class
 * @classdesc Generic DavObject aka file
 */
export class DavObject extends DAVEventListener {

	/**
	 * @param {DavCollection} parent - The parent collection this DavObject is a child of
	 * @param {Request} request - The request object initialized by DavClient
	 * @param {String} url - Full url of this DavObject
	 * @param {Object} props - Properties including etag, content-type, etc.
	 * @param {boolean} isPartial - Are we dealing with the complete or just partial addressbook / calendar data
	 */
	constructor(parent, request, url, props, isPartial = false) {
		super();

		Object.assign(this, {
			// parameters
			_parent: parent,
			_request: request,
			_url: url,
			_props: props,
			// housekeeping
			_isPartial: isPartial,
			_isDirty: false
		});

		this._exposeProperty('etag', NS.DAV, 'getetag', true);
		this._exposeProperty('contenttype', NS.DAV, 'getcontenttype');

		Object.defineProperty(this, 'url', {
			get: () => this._url
		});
	}

	/**
	 * gets unfiltered data for this object
	 *
	 * @returns {Promise<void>}
	 */
	async fetchCompleteData() {
		if (!this.isPartial()) {
			return;
		}

		const request = await this._request.propFind(this._url, this.constructor.getPropFindList(), 0);
		this._props = request.body;
		this._isDirty = false;
		this._isPartial = false;
	}

	/**
	 * copies a DavObject to a different DavCollection
	 * @param {DavCollection} collection
	 * @param {Boolean} overwrite
	 * @returns {Promise<DavObject>} Promise that resolves to the copied DavObject
	 */
	async copy(collection, overwrite = false) {
		debug(`copying ${this.url} from ${this._parent.url} to ${collection.url}`);

		if (this._parent === collection) {
			throw new Error('Copying an object to the collection it\'s already part of is not supported');
		}
		if (!this._parent.isSameCollectionTypeAs(collection)) {
			throw new Error('Copying an object to a collection of a different type is not supported');
		}
		if (!collection.isWriteable()) {
			throw new Error('Can not copy object into read-only destination collection');
		}

		const uri = this.url.split('/').splice(-1, 1)[0];
		const destination = collection.url + uri;

		await this._request.copy(this.url, destination, 0, overwrite);
		return collection.find(uri);
	}

	/**
	 * moves a DavObject to a different DavCollection
	 * @param {DavCollection} collection
	 * @param {Boolean} overwrite
	 * @returns {Promise<void>}
	 */
	async move(collection, overwrite = false) {
		debug(`moving ${this.url} from ${this._parent.url} to ${collection.url}`);

		if (this._parent === collection) {
			throw new Error('Moving an object to the collection it\'s already part of is not supported');
		}
		if (!this._parent.isSameCollectionTypeAs(collection)) {
			throw new Error('Moving an object to a collection of a different type is not supported');
		}
		if (!collection.isWriteable()) {
			throw new Error('Can not move object into read-only destination collection');
		}

		const uri = this.url.split('/').splice(-1, 1)[0];
		const destination = collection.url + uri;

		await this._request.move(this.url, destination, overwrite);
		this._parent = collection;
		this._url = destination;
	}

	/**
	 * updates the DavObject on the server
	 * @returns {Promise<void>}
	 */
	async update() {
		// 1. Do not update filtered objects, because we would be loosing data on the server
		// 2. No need to update if object was never modified
		// 3. Do not update if called directly on DavObject, because there is no data prop
		if (this.isPartial() || !this.isDirty() || !this.data) {
			return;
		}

		const headers = {};
		if (this.etag) {
			headers['If-Match'] = this.etag;
		}

		return this._request.put(this.url, headers, this.data).then((res) => {
			this._isDirty = false;
			// Don't overwrite content-type, it's set to text/html in the response ...
			this._props['{DAV:}getetag'] = res.xhr.getResponseHeader('etag');
		}).catch((ex) => {
			this._isDirty = true;

			if (ex instanceof NetworkRequestClientError && ex.status === 412) {
				this._isPartial = true;
			}

			throw ex;
		});
	}

	/**
	 * deletes the DavObject on the server
	 *
	 * @returns {Promise<void>}
	 */
	async delete() {
		return this._request.delete(this.url);
	}

	/**
	 * returns whether the data in this DavObject is the result of a partial retrieval
	 *
	 * @returns {boolean}
	 */
	isPartial() {
		return this._isPartial;
	}

	/**
	 * returns whether the data in this DavObject contains unsynced changes
	 *
	 * @returns {boolean}
	 */
	isDirty() {
		return this._isDirty;
	}

	/**
	 * @protected
	 * @param {String} localName
	 * @param {String} xmlNamespace
	 * @param {String} xmlName
	 * @param {boolean} mutable
	 * @returns void
	 */
	_exposeProperty(localName, xmlNamespace, xmlName, mutable = false) {
		if (mutable) {
			Object.defineProperty(this, localName, {
				get: () => this._props[`{${xmlNamespace}}${xmlName}`],
				set: (val) => {
					this._isDirty = true;
					this._props[`{${xmlNamespace}}${xmlName}`] = val;
				}
			});
		} else {
			Object.defineProperty(this, localName, {
				get: () => this._props[`{${xmlNamespace}}${xmlName}`]
			});
		}
	}

	/**
	 * A list of all property names that should be included
	 * in propfind requests that may include this object
	 *
	 * @returns {string[][]}
	 */
	static getPropFindList() {
		return [
			[NS.DAV, 'getcontenttype'],
			[NS.DAV, 'getetag'],
			[NS.DAV, 'resourcetype']
		];
	}

}
