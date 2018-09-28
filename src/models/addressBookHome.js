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
import { DavCollection } from './davCollection.js';
import * as NS from '../utility/namespaceUtility.js';
import { AddressBook } from './addressBook.js';

import { debugFactory } from '../debug.js';
const debug = debugFactory('AddressBookHome');

/**
 * This class represents an address book home as specified in
 * https://tools.ietf.org/html/rfc6352#section-7.1.1
 *
 * As of this versions' release, the Nextcloud server will always
 * return only one address book home. Despite that, RFC6352 allows
 * a server to return multiple address book homes though.
 */
export class AddressBookHome extends DavCollection {

	/**
	 * @inheritDoc
	 */
	constructor(...args) {
		super(...args);

		super._registerCollectionFactory('{' + NS.IETF_CARDDAV + '}addressbook', AddressBook);
	}

	/**
	 * finds all address books in this address book home
	 *
	 * @returns {Promise<AddressBook[]>}
	 */
	async findAllAddressBooks() {
		return super.findAllByFilter((elm) => elm instanceof AddressBook);
	}

	/**
     * creates a new address book collection
	 *
     * @param {String} displayname
     * @returns {Promise<AddressBook>}
     */
	async createAddressBookCollection(displayname) {
		debug('creating an addressbook collection');

		const props = [{
			name: [NS.DAV, 'resourcetype'],
			children: [{
				name: [NS.DAV, 'collection']
			}, {
				name: [NS.IETF_CARDDAV, 'addressbook']
			}]
		}, {
			name: [NS.DAV, 'displayname'],
			value: displayname
		}];

		const name = super._getAvailableNameFromToken(displayname);
		return super.createCollection(name, props);
	}

}
