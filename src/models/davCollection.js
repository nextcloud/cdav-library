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
import * as NS from '../utility/namespaceUtility.js';
import * as StringUtility from '../utility/stringUtility.js';
import * as XMLUtility from '../utility/xmlUtility.js';
import DAVEventListener from './davEventListener.js';

import { debugFactory } from '../debug.js';
import davCollectionPropSet from '../propset/davCollectionPropSet.js';
import { DavObject } from './davObject.js';
const debug = debugFactory('DavCollection');

export class DavCollection extends DAVEventListener {

	/**
	 * @param {Object} parent
	 * @param {Request} request
	 * @param {String} url
	 * @param {Object} props
	 */
	constructor(parent, request, url, props) {
		super();

		// This is a collection, so always make sure to end with a /
		if (url.substr(-1) !== '/') {
			url += '/';
		}

		Object.assign(this, {
			// parameters
			_parent: parent,
			_request: request,
			_url: url,
			_props: props,
			// constructors
			_collectionFactoryMapper: {},
			_objectFactoryMapper: {},
			// house keeping
			_updatedProperties: [],
			_childrenNames: [],

			// parsers / factories
			_propFindList: [],
			_propSetFactory: []

		});

		this._registerPropSetFactory(davCollectionPropSet);

		this._exposeProperty('displayname', NS.DAV, 'displayname', true);
		this._exposeProperty('owner', NS.DAV, 'owner');
		this._exposeProperty('resourcetype', NS.DAV, 'resourcetype');
		this._exposeProperty('syncToken', NS.DAV, 'sync-token');
		this._exposeProperty('currentUserPrivilegeSet', NS.DAV, 'current-user-privilege-set');

		Object.defineProperty(this, 'url', {
			get: () => this._url
		});

		this._propFindList.push(...DavObject.getPropFindList());
		this._propFindList.push(...DavCollection.getPropFindList());
	}

	/**
	 * finds all children of a collection
	 *
	 * @returns {Promise<DavObject[]|DavCollection[]>}
	 */
	async findAll() {
		const response = await this._request.propFind(this._url, this._propFindList, 1);
		return this._handleMultiStatusResponse(response, false);
	}

	/**
	 * finds all children of a collection filtered by filter
	 *
	 * @param {Function} filter
	 * @returns {Promise<DavObject[]|DavCollection[]>}
	 */
	async findAllByFilter(filter) {
		const all = await this.findAll();
		return all.filter(filter);
	}

	/**
	 * find one object by its uri
	 *
	 * @param {String} uri
	 * @returns {Promise<DavObject|DavCollection>}
	 */
	async find(uri) {
		const response = await this._request.propFind(this._url + uri, this._propFindList, 0);
		response.body = { [this._url + uri]: response.body };
		return this._handleMultiStatusResponse(response, false)[0];
	}

	/**
	 * creates a new webdav collection
	 * https://tools.ietf.org/html/rfc5689
	 *
	 * You usually don't want to call this method directly
	 * but instead use:
	 * - AddressBookHome->createAddressBookCollection
	 * - CalendarHome->createCalendarCollection
	 * - CalendarHome->createSubscribedCollection
	 *
	 * @param {string} name
	 * @param {?Array} props
	 * @returns {Promise<DavCollection>}
	 */
	async createCollection(name, props = null) {
		debug('creating a collection');

		if (!props) {
			props = [{
				name: [NS.DAV, 'resourcetype'],
				children: [{
					name: [NS.DAV, 'collection']
				}]
			}];
		}

		const [skeleton, dPropChildren] = XMLUtility.getRootSkeleton(
			[NS.DAV, 'mkcol'],
			[NS.DAV, 'set'],
			[NS.DAV, 'prop']
		);

		dPropChildren.push(...props);

		const uri = this._getAvailableNameFromToken(name);
		const data = XMLUtility.serialize(skeleton);
		await this._request.mkCol(this.url + uri, {}, data);
		return this.find(uri + '/');
	}

	/**
	 * creates a new webdav object inside this collection
	 *
	 * You usually don't want to call this method directly
	 * but instead use:
	 * - AddressBook->createVCard
	 * - Calendar->createVObject
	 *
	 * @param {String} name
	 * @param {Object} headers
	 * @param {String} data
	 * @returns {Promise<DavObject>}
	 */
	async createObject(name, headers, data) {
		debug('creating an object');

		await this._request.put(this.url + name, headers, data);
		return this.find(name);
	}

	/**
	 * sends a PropPatch request to update the collections' properties
	 * The request is only made if properties actually changed
	 *
	 * @returns {Promise<void>}
	 */
	async update() {
		if (this._updatedProperties.length === 0) {
			return;
		}

		const properties = {};
		this._updatedProperties.forEach((updatedProperty) => {
			properties[updatedProperty] = this._props[updatedProperty];
		});
		const propSet = this._propSetFactory.reduce((arr, p) => [...arr, ...p(properties)], []);

		const [skeleton, dPropSet] = XMLUtility.getRootSkeleton(
			[NS.DAV, 'propertyupdate'],
			[NS.DAV, 'set'],
			[NS.DAV, 'prop']);

		dPropSet.push(...propSet);

		const body = XMLUtility.serialize(skeleton);
		await this._request.propPatch(this._url, {}, body);
	}

	/**
	 * deletes the DavCollection on the server
	 *
	 * @param {Object} headers - additional HTTP headers to send
	 * @returns {Promise<void>}
	 */
	async delete(headers = {}) {
		await this._request.delete(this._url, headers);
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isReadable() {
		return this.currentUserPrivilegeSet.includes('{DAV:}read');
	}

	/**
	 *
	 * @returns {boolean}
	 */
	isWriteable() {
		return this.currentUserPrivilegeSet.includes('{DAV:}write');
	}

	/**
	 * checks whether this is of the same type as another collection
	 * @param {DavCollection} collection
	 */
	isSameCollectionTypeAs(collection) {
		const ownResourceType = this.resourcetype;
		const foreignResourceType = collection.resourcetype;

		const ownDiff = ownResourceType.find((r) => foreignResourceType.indexOf(r) === -1);
		const foreignDiff = foreignResourceType.find((r) => ownResourceType.indexOf(r) === -1);

		return ownDiff === undefined && foreignDiff === undefined;
	}

	/**
	 * @protected
	 * @param {String} identifier
	 * @param {Function} factory
	 * @returns void
	 */
	_registerCollectionFactory(identifier, factory) {
		this._collectionFactoryMapper[identifier] = factory;
		if (typeof factory.getPropFindList === 'function') {
			this._propFindList.push(...factory.getPropFindList());
		}
	}

	/**
	 * @protected
	 * @param {String} identifier
	 * @param {Function} factory
	 * @returns void
	 */
	_registerObjectFactory(identifier, factory) {
		this._objectFactoryMapper[identifier] = factory;
		if (typeof factory.getPropFindList === 'function') {
			this._propFindList.push(...factory.getPropFindList());
		}
	}

	/**
	 * @protected
	 * @param factory
	 * @returns void
	 */
	_registerPropSetFactory(factory) {
		this._propSetFactory.push(factory);
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
					this._props[`{${xmlNamespace}}${xmlName}`] = val;
					if (this._updatedProperties.indexOf(`{${xmlNamespace}}${xmlName}`) === -1) {
						this._updatedProperties.push(`{${xmlNamespace}}${xmlName}`);
					}
				}
			});
		} else {
			Object.defineProperty(this, localName, {
				get: () => this._props[`{${xmlNamespace}}${xmlName}`]
			});
		}
	}

	/**
	 * @protected
	 * @param {String} token
	 * @returns {String}
	 */
	_getAvailableNameFromToken(token) {
		return StringUtility.uri(token, name => {
			return this._childrenNames.indexOf(this._url + name) === -1
				&& this._childrenNames.indexOf(this._url + name + '/') === -1;
		});
	}

	/**
	 * get updated properties for this collection from server
	 * @protected
	 * @returns {Object}
	 */
	async _updatePropsFromServer() {
		const response = await this._request.propFind(this.url, this.constructor.getPropFindList());
		this._props = response.body;
	}

	/**
	 * @param {Object} response
	 * @param {Boolean} isPartial
	 * @returns {DavObject[]|DavCollection[]}
	 * @protected
	 */
	_handleMultiStatusResponse(response, isPartial = false) {
		const index = [];
		const children = [];

		Object.entries(response.body).forEach(([path, props]) => {
			// The DAV Server will always return a propStat
			// block containing properties of the current url
			// we are not interested, so let's filter it out
			if (path === this._url || path + '/' === this.url) {
				return;
			}

			index.push(path);
			const url = this._request.pathname(path);

			// empty resourcetype property => this is no collection
			if (props['{DAV:}resourcetype'].length === 0) {
				debug(`${path} was identified as a file`);

				const contentType = props['{DAV:}getcontenttype'].split(';')[0];
				if (!this._objectFactoryMapper[contentType]) {
					debug(`No constructor for content-type ${contentType} (${path}) registered, treating as generic object`);
					children.push(new DavObject(this, this._request, url, props));
					return;
				}

				children.push(new this._objectFactoryMapper[contentType](this, this._request, url, props, isPartial));
			} else {
				debug(`${path} was identified as a collection`);

				// get first collection type other than DAV collection
				const collectionType = props['{DAV:}resourcetype'].find((r) => {
					return r !== `{${NS.DAV}}collection`;
				});

				if (!collectionType) {
					debug(`Collection-type of ${path} was not specified, treating as generic collection`);
					children.push(new DavCollection(this, this._request, url, props));
					return;
				}
				if (!this._collectionFactoryMapper[collectionType]) {
					debug(`No constructor for collection-type ${collectionType} (${path}) registered, treating as generic collection`);
					children.push(new DavCollection(this, this._request, url, props));
					return;
				}

				children.push(new this._collectionFactoryMapper[collectionType](this, this._request, url, props));
			}
		});

		this._childrenNames.push(...index);
		return children;
	}

	/**
	 * A list of all property names that should be included
	 * in propfind requests that may include this collection
	 *
	 * @returns {string[][]}
	 */
	static getPropFindList() {
		return [
			[NS.DAV, 'displayname'],
			[NS.DAV, 'owner'],
			[NS.DAV, 'resourcetype'],
			[NS.DAV, 'sync-token'],
			[NS.DAV, 'current-user-privilege-set']
		];
	}

}
