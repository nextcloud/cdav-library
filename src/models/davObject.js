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

import DAVEventListener from "./davEventListener.js";
import * as NS from "../utility/namespaceUtility.js";

import {debugFactory} from "../debug.js";
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
	constructor(parent, request, url, props, isPartial=false) {
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

		this._exposeProperty('etag', NS.DAV, 'getetag');
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
		if (!this._isPartial) {
			return;
		}

		this._props = await this._request.propFind(this._url, this.constructor.getPropFindList(), 0);
		this._isDirty = false;
		this._isPartial = false;
	}

	/**
	 * copies a DavObject to a different DavCollection
	 * @param {DavCollection} collection
	 * @returns {Promise<DavObject>} Promise that resolves to the copied DavObject
	 */
	async copy(collection) {
		debug(`copying ${this.url} from ${this._parent.url} to ${collection.url}`);

		// TODO: implement me
		// TODO: compare resourcetype of both collections, current and destination
	}

	/**
	 * moves a DavObject to a different DavCollection
	 * @param {DavCollection} collection
	 * @returns {Promise<void>}
	 */
	async move(collection) {
		debug(`moving ${this.url} from ${this._parent.url} to ${collection.url}`);

		// TODO: implement me
		// TODO: compare resourcetype of both collections, current and destination
	}

	/**
	 * updates the DavObject on the server
	 * @returns {Promise<void>}
	 */
	async update() {
		// don't update filtered object because we would
		// delete all other properties on the server
		if (this._isPartial) {
			return;
		}

		// no need to update the object if it was not modified
		if (!this._isDirty) {
			return;
		}

		const headers = {
			'If-Match': this.etag,
		};

		// TODO - update E-TAG
		// TODO - update Content-Type? should stay the same but let's be on the safe side
		return this._request.put(this.url, headers, this.data).then((res) => {
			this._isDirty = false;
			return res;
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
	 * @protected
	 * @param {String} localName
	 * @param {String} xmlNamespace
	 * @param {String} xmlName
	 * @param {boolean} mutable
	 * @returns void
	 */
	_exposeProperty(localName, xmlNamespace, xmlName, mutable=false) {
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
